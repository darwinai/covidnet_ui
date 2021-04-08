import { InputGroup, InputGroupText, Spinner, TextInput } from "@patternfly/react-core";
import { FilterIcon, SearchIcon } from "@patternfly/react-icons";
import { css } from "@patternfly/react-styles";
import styles from "@patternfly/react-styles/css/components/Table/table";
import { expandable, Table, TableBody, TableHeader } from "@patternfly/react-table";
import React, { ReactNode, useEffect, useState, useReducer, useRef } from "react";
import { AppContext } from "../../context/context";
import { StudyInstanceWithSeries } from "../../context/reducers/analyseReducer";
import ChrisIntegration from "../../services/chris_integration";
import SeriesTable from "./seriesTable";
import { Badge } from "@patternfly/react-core";
import { calculatePatientAge } from "../../shared/utils";
import useInterval from "../../shared/useInterval";
import { RESULT_POLL_INTERVAL } from "../../app.config";

interface tableRowsParent {
  isOpen: boolean,
  cells: string[],
  feedIds: number[],
  isProcessing: boolean
}

interface tableRowsChild {
  isOpen: boolean,
  parent: number,
  fullWidth: boolean,
  cells: { [title: string]: ReactNode }[],
  feedIds: number[],
  isProcessing: boolean
}

type TableState = {
  page: number, // Current table page number
  maxFeedId: number | undefined, // ID of the latest Feed on Swift as of when PastAnalysisTable first mounted OR was last reset
  lastOffset: number, // Page offset value for where to begin fetching the next unseen page
  lastPage: number, // Table page number of the very last page (-1 means last page has not yet been seen)
  storedPages: StudyInstanceWithSeries[], // Stores pages that have been seen in an array of pages
  processingFeedIds: number[] // Stores plugin ids associated with images that are currently processing, used for selective polling
}

const initialTableState: TableState = {
  page: 0,
  maxFeedId: -1,
  lastOffset: 0,
  lastPage: -1,
  storedPages: [],
  processingFeedIds: []
}

enum TableReducerActions {
  updateMaxFeedId = "UPDATE_MAX_FEED_ID",
  addNewPage = "ADD_NEW_PAGE",
  incrementPage = "INCREMENT_PAGE",
  decrementPage = "DECREMENT_PAGE"
}

type TableAction =
  | { type: TableReducerActions.updateMaxFeedId, payload: { id: number } }
  | { type: TableReducerActions.addNewPage, payload: { lastOffset: number, lastPage: number, newPage: StudyInstanceWithSeries[], processingPluginIds: number[] } }
  | { type: TableReducerActions.incrementPage }
  | { type: TableReducerActions.decrementPage }

const tableReducer = (state: TableState, action: TableAction): TableState => {
  switch(action.type) {
    case TableReducerActions.updateMaxFeedId:
      return {
        ...initialTableState,
        maxFeedId: action.payload.id,
      }
    case TableReducerActions.addNewPage:
      return {
        ...state,
        lastOffset: action.payload.lastOffset,
        lastPage: action.payload.lastPage,
        storedPages: [...state.storedPages, ...action.payload.newPage],
        processingFeedIds: [...state.processingFeedIds, ...action.payload.processingPluginIds]
      }
    case TableReducerActions.incrementPage:
      return {
        ...state,
        page: state.page + 1
      }
    case TableReducerActions.decrementPage:
      return {
        ...state,
        page: state.page - 1
      }
    default: return state;
  }
}

const PastAnalysisTable = () => {
  const { state: {
    prevAnalyses: { perpage }
  },
    dispatch } = React.useContext(AppContext);
  const [loading, setLoading] = useState(true);

  const [tableState, tableDispatch] = useReducer(tableReducer, initialTableState);

  const columns = [
    {
      title: "Study",
      cellFormatters: [expandable]
    },
    "Patient MRN", "Patient DOB", "Patient Age", "Analysis Created", ""
  ]
  const [rows, setRows] = useState<(tableRowsChild | tableRowsParent)[]>([])

  // Stores an array of the "Analysis Created" property of the rows of page 0 of the table
  // Used to identify which rows are new and need to be highlighted green
  const newRowsRef = useRef<string[]>([]);

  // Reset table and update the maxFeedId to the latest Feed ID in Swift
  const updateMaxFeedId = async () => {
    const id: number = await ChrisIntegration.getLatestFeedId()
    tableDispatch({ type: TableReducerActions.updateMaxFeedId, payload: { id } });
  }

  useEffect(() => {
    updateMaxFeedId();
  }, [])

  useEffect(() => {
    (async () => {
      const { maxFeedId, page, lastOffset, storedPages } = tableState;

      if (!maxFeedId || maxFeedId >= 0) {
        setLoading(true);
        // Accumulates with the rows of current page
        let curAnalyses: StudyInstanceWithSeries[] = [];

        // If current page has not yet been seen
        if (storedPages.length < page * perpage + perpage && tableState.lastPage !== tableState.page) {
          const toFetch = page * perpage + perpage - storedPages.length
          const [newAnalyses, newOffset, isAtEndOfFeeds] = await ChrisIntegration.getPastAnalyses(lastOffset, toFetch, maxFeedId);

          // Extracts the plugin IDs associated with studies that are processing (have no analysisCreated date)
          const processingPluginIds = newAnalyses.filter((study: StudyInstanceWithSeries) => !!study.pluginStatuses.jobsRunning)
          .map((study: StudyInstanceWithSeries) => study.feedIds?.[0]);

          
          tableDispatch({ type: TableReducerActions.addNewPage, payload: {
            lastOffset: newOffset,
            lastPage: isAtEndOfFeeds ? page : -1,
            newPage: newAnalyses,
            processingPluginIds
          }});
          curAnalyses = storedPages.slice(page * perpage, page * perpage + perpage).concat(newAnalyses);
        } else {
          // If page has already been seen, access its contents from storedPages
          curAnalyses = storedPages.slice(page * perpage, page * perpage + perpage)
        }
        updateRows(curAnalyses);
      }
      setLoading(false);
    })();
  }, [tableState, perpage, dispatch]);

  // Polls ChRIS backend and refreshes table if any of the plugins with the given IDs have a terminated status
  useInterval(async () => {
    if (tableState.processingFeedIds) {
      for (const id of tableState.processingFeedIds) {
        const refresh: boolean = await ChrisIntegration.checkIfPluginTerminated(id);
        if (refresh) {
          // Right before updating max feed ID and refreshing table, get a list of all the "Analysis Created" properties on page 0
          newRowsRef.current = tableState.storedPages.slice(0, perpage)?.map((study: StudyInstanceWithSeries) => study.analysisCreated);
          updateMaxFeedId();
          return;
        }
      }
    }
  }, tableState.processingFeedIds.length ? RESULT_POLL_INTERVAL : 0); // Pauses polling if there are no processing rows

  const updateRows = (listOfAnalyses: StudyInstanceWithSeries[]) => {
    const newRows: (tableRowsChild | tableRowsParent)[] = [];
    for (const analysis of listOfAnalyses) {
      const indexInRows = newRows.length;
      const isProcessing = !!analysis.pluginStatuses.jobsRunning;
      let analysisCreated;
      let badges;
      if (isProcessing) {
        analysisCreated = {
          title: (<div><Spinner size="md" /> Processing</div>)
        };
        badges = "";
      } else {
        analysisCreated = analysis.analysisCreated;
        badges = {
          title: (
          <>
            {<Badge className="badge-margin" isRead={!analysis.pluginStatuses.jobsDone}>{analysis.pluginStatuses.jobsDone}</Badge>}
            {<Badge className="badge-danger" isRead={!analysis.pluginStatuses.jobsErrored}>{analysis.pluginStatuses.jobsErrored}</Badge>}
          </>)
        };
      }

      const cells: any[] = [
        analysis.dcmImage.StudyDescription,
        analysis.dcmImage.PatientID,
        analysis.dcmImage.PatientBirthDate,
        `${calculatePatientAge(analysis.dcmImage.PatientBirthDate)}y`,
        analysisCreated,
        badges
      ];

      // Top-level row
      newRows.push({
        isOpen: false,
        cells: cells,
        feedIds: analysis.feedIds,
        isProcessing
      });

      // Blank nested row
      if (analysis.feedIds.length > 0) {
        newRows.push({
          isOpen: false,
          parent: indexInRows,
          fullWidth: true,
          cells: [],
          feedIds: [],
          isProcessing
        });
      }
    }
    setRows(newRows);
  }

  const onCollapse = async (event: any, rowKey: number, isOpen: any) => {
    newRowsRef.current = []; // Reset to prevent highlight animation from playing again
    const rowsCopy = [...rows];
    rowsCopy[rowKey].isOpen = isOpen;

    const data = ChrisIntegration.getResults(rowsCopy[rowKey].feedIds);
    const isProcessing = rowsCopy[rowKey].isProcessing;

    rowsCopy[rowKey + 1] = {
      isOpen: false,
      parent: rowKey,
      fullWidth: true,
      cells: [{
        title: (<SeriesTable data={data} isProcessing={isProcessing}></SeriesTable>)
      }],
      feedIds: [],
      isProcessing
    }

    setRows(rowsCopy);
  }

  const customRowWrapper = (tableRow: any) => {
    const {
      trRef,
      className,
      rowProps,
      row: { isExpanded, cells },
      ...props
    } = tableRow;

    const isAnalyzing: boolean = cells[4] && cells[4].title; // 4 is the index of Analysis Created column

    // Style the current row
    let backgroundStyle = {};
    if (isAnalyzing) {
      backgroundStyle = { "backgroundColor": "#F9E0A2" }; // Processing rows
    } else if (newRowsRef.current?.length > 0 && !newRowsRef.current.includes(cells[4])) {
      backgroundStyle = { "animation": "new-row-highlight-animation 2s linear" }; // Newly added rows
    } else {
      backgroundStyle = { "backgroundColor": "#FFFFFF" }; // Default
    }

    return (
      <tr
        {...props}
        ref={trRef}
        className={css(
          className,
          "custom-static-class",
          isExpanded !== undefined && styles.tableExpandableRow,
          isExpanded && styles.modifiers.expanded
        )}
        hidden={isExpanded !== undefined && !isExpanded}
        style={backgroundStyle}
      />
    );
  }

  const searchMRN = (text: string) => {
    newRowsRef.current = []; // Reset to prevent highlight animation from playing again
    updateRows(tableState.storedPages.filter((analysis: StudyInstanceWithSeries) => analysis.dcmImage.PatientID.includes(text)))
  }

  return (
    <div className="PastAnalysis">
      <h2 className="PastAnalysisTitle">Past predictive analysis</h2>
      <div className="MRNsearchBar">
        <InputGroup>
          <InputGroupText>
            <FilterIcon />
          </InputGroupText>
          <TextInput id="textInput5" type="number" placeholder="Patient MRN" aria-label="Dollar amount input example" onChange={searchMRN} />
          <InputGroupText> <SearchIcon /> </InputGroupText>
        </InputGroup>
      </div>

      <div style={{ float: "right" }}>
        <button className="pf-c-button pf-m-inline pf-m-tertiary pf-m-display-sm" type="button" style={{ marginRight: "1em" }} onClick={() => tableDispatch({ type: TableReducerActions.decrementPage })} disabled={loading || tableState.page == 0}>
          <span className="pf-c-button__icon pf-m-end">
            <i className="fas fa-arrow-left" aria-hidden="true"></i>
          </span>
      &nbsp; Previous {perpage}
        </button>
        <button className="pf-c-button pf-m-inline pf-m-tertiary pf-m-display-sm" type="button" onClick={() => tableDispatch({ type: TableReducerActions.incrementPage })} disabled={loading || tableState.page === tableState.lastPage}>Next {perpage}
          <span className="pf-c-button__icon pf-m-end">
            <i className="fas fa-arrow-right" aria-hidden="true"></i>
          </span>
        </button>
      </div>
      { loading ? (
        <div className="loading">
          <Spinner size="xl" /> &nbsp; Loading
        </div>
      ) : (
        <Table aria-label="Collapsible table" id="pastAnalysisTable"
          onCollapse={onCollapse} rows={rows} cells={columns}
          rowWrapper={customRowWrapper}
        >
          <TableHeader />
          <TableBody />
        </Table>
      )
      }
    </div>
  );
}

export default PastAnalysisTable;
