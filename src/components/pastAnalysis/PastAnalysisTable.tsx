import { InputGroup, InputGroupText, Spinner, TextInput } from "@patternfly/react-core";
import { FilterIcon, SearchIcon } from "@patternfly/react-icons";
import { css } from "@patternfly/react-styles";
import styles from "@patternfly/react-styles/css/components/Table/table";
import { expandable, Table, TableBody, TableHeader } from "@patternfly/react-table";
import React, { ReactNode, useEffect, useState, useReducer, useRef } from "react";
import { AnalysisTypes } from "../../context/actions/types";
import { AppContext } from "../../context/context";
import { ISeries, StudyInstanceWithSeries } from "../../context/reducers/analyseReducer";
import ChrisIntegration from "../../services/chris_integration";
import SeriesTable from "./seriesTable";
import { Badge } from "@patternfly/react-core";
import { calculatePatientAge } from "../../shared/utils";
import useInterval from "../../shared/useInterval";
import { RESULT_POLL_INTERVAL } from "../../app.config";

interface tableRowsParent {
  isOpen: boolean,
  cells: string[]
}

interface tableRowsChild {
  isOpen: boolean,
  parent: number,
  fullWidth: boolean,
  cells: { [title: string]: ReactNode }[]
}

type TableState = {
  page: number, // Current table page number
  maxFeedId: number | undefined, // ID of the latest Feed on Swift as of when PastAnalysisTable first mounted OR was last reset
  lastOffset: number, // Page offset value for where to begin fetching the next unseen page
  lastPage: number, // Table page number of the very last page (-1 means last page has not yet been seen)
  storedPages: StudyInstanceWithSeries[][], // Stores pages that have been seen in an array of pages
  processingPluginIds: number[] // Stores plugin ids associated with images that are currently processing, used for selective polling
}

const INITIAL_TABLE_STATE: TableState = {
  page: 0,
  maxFeedId: -1,
  lastOffset: 0,
  lastPage: -1,
  storedPages: [],
  processingPluginIds: []
}

enum TableReducerActions {
  UPDATE_MAX_FEED_ID = "UPDATE_MAX_FEED_ID",
  ADD_NEW_PAGE = "ADD_NEW_PAGE",
  INCREMENT_PAGE = "INCREMENT_PAGE",
  DECREMENT_PAGE = "DECREMENT_PAGE"
}

type TableAction =
  | { type: TableReducerActions.UPDATE_MAX_FEED_ID, payload: { id: number } }
  | { type: TableReducerActions.ADD_NEW_PAGE, payload: { lastOffset: number, lastPage: number, newPage: StudyInstanceWithSeries[], processingPluginIds: number[] } }
  | { type: TableReducerActions.INCREMENT_PAGE }
  | { type: TableReducerActions.DECREMENT_PAGE }

const tableReducer = (state: TableState, action: TableAction): TableState => {
  switch(action.type) {
    case TableReducerActions.UPDATE_MAX_FEED_ID:
      return {
        ...INITIAL_TABLE_STATE,
        maxFeedId: action.payload.id,
      }
    case TableReducerActions.ADD_NEW_PAGE:
      return {
        ...state,
        lastOffset: action.payload.lastOffset,
        lastPage: action.payload.lastPage,
        storedPages: [...state.storedPages, action.payload.newPage],
        processingPluginIds: [...state.processingPluginIds, ...action.payload.processingPluginIds]
      }
    case TableReducerActions.INCREMENT_PAGE:
      return {
        ...state,
        page: state.page + 1
      }
    case TableReducerActions.DECREMENT_PAGE:
      return {
        ...state,
        page: state.page - 1
      }
    default: return state;
  }
}

const PastAnalysisTable = () => {
  const { state: { prevAnalyses: { perpage } }, dispatch } = React.useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);

  const [tableState, tableDispatch] = useReducer(tableReducer, INITIAL_TABLE_STATE);

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
    tableDispatch({ type: TableReducerActions.UPDATE_MAX_FEED_ID, payload: { id } });
  }

  useEffect(() => {
    updateMaxFeedId();
  }, [])

  useEffect(() => {
    (async () => {
      const { maxFeedId, page, lastOffset, storedPages } = tableState;

      if (!maxFeedId || maxFeedId >= 0) {
        setIsLoading(true);
        // Accumulates with the rows of current page
        let curAnalyses: StudyInstanceWithSeries[] = [];

        // If current page has not yet been seen
        if (page >= storedPages.length) {
          const [newAnalyses, newOffset, isAtEndOfFeeds] = await ChrisIntegration.getPastAnalyses(lastOffset, perpage, maxFeedId);

          // Extracts the plugin IDs associated with studies that are processing (have no analysisCreated date)
          const processingPluginIds = newAnalyses.filter((study: StudyInstanceWithSeries) => !study.analysisCreated)
          .flatMap((study: StudyInstanceWithSeries) => study.series.map((series: ISeries) => series.covidnetPluginId));

          curAnalyses = newAnalyses;
          tableDispatch({ type: TableReducerActions.ADD_NEW_PAGE, payload: {
            lastOffset: newOffset,
            lastPage: isAtEndOfFeeds ? page : -1,
            newPage: curAnalyses,
            processingPluginIds
          }});

        } else {
          // If page has already been seen, access its contents from storedPages
          curAnalyses = storedPages[page];
        }

        updateRows(curAnalyses);
      }
      setIsLoading(false);
    })();
  }, [tableState, perpage, dispatch]);

  // Polls ChRIS backend and refreshes table if any of the plugins with the given IDs have a terminated status
  useInterval(async () => {
    if (tableState.processingPluginIds) {
      for (const id of tableState.processingPluginIds) {
        const refresh = await ChrisIntegration.checkIfPluginTerminated(id);
        if (refresh) {
          // Right before updating max feed ID and refreshing table, get a list of all the "Analysis Created" properties on page 0
          newRowsRef.current = tableState.storedPages[0]?.map((study: StudyInstanceWithSeries) => study.analysisCreated);
          updateMaxFeedId();
          return;
        }
      }
    }
  }, tableState.processingPluginIds.length ? RESULT_POLL_INTERVAL : 0); // Pauses polling if there are no processing rows

  const updateRows = (listOfAnalysis: StudyInstanceWithSeries[]) => {
    const rows: (tableRowsChild | tableRowsParent)[] = [];
    for (const analysis of listOfAnalysis) {
      const validAnalyses = analysis.series.filter((series: ISeries) => series.classifications.size > 0);
      const classifications = validAnalyses?.[0]?.classifications ? Array.from(validAnalyses?.[0]?.classifications?.keys()) : [];
      const numInvalidAnalyses = analysis.series.length - validAnalyses.length;

      const indexInRows: number = rows.length;

      const isProcessing = !analysis.analysisCreated;
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
          title: (<>
            {<Badge className="badge-margin" isRead={!validAnalyses.length}>{validAnalyses.length}</Badge>}
            {<Badge className="badge-danger" isRead={!numInvalidAnalyses}>{numInvalidAnalyses}</Badge>}
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

      rows.push({
        isOpen: false,
        cells: cells
      });
      if (analysis.series.length > 0) {
        rows.push({
          isOpen: false,
          parent: indexInRows,
          fullWidth: true,
          cells: [{
            title: (<SeriesTable studyInstance={analysis} isProcessing={isProcessing} classifications={classifications}></SeriesTable>)
          }]
        });
      }
    }
    setRows(rows);
  }

  const onCollapse = (event: any, rowKey: number, isOpen: any) => {
    newRowsRef.current = []; // Reset to prevent highlight animation from playing again
    const rowsCopy = [...rows];
    rowsCopy[rowKey].isOpen = isOpen;
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
    updateRows(tableState.storedPages[tableState.page].filter((analysis: StudyInstanceWithSeries) => analysis.dcmImage.PatientID.includes(text)))
  }

  const decrementPage = () => {
    tableDispatch({ type: TableReducerActions.DECREMENT_PAGE });
  }

  const incrementPage = () => {
    tableDispatch({ type: TableReducerActions.INCREMENT_PAGE });
  }

  return (
    <div className="PastAnalysis flex-column">
      <div>
        <h2 className="PastAnalysisTitle">Past predictive analysis</h2>
        <div className="flex-row-space-between">
          <div className="MRNsearchBar">
            <InputGroup>
              <InputGroupText>
                <FilterIcon />
              </InputGroupText>
              <TextInput id="textInput5" type="number" placeholder="Patient MRN" aria-label="Dollar amount input example" onChange={searchMRN} />
              <InputGroupText> <SearchIcon /> </InputGroupText>
            </InputGroup>
          </div>

          <div className="page-navigation-buttons">
            <button className="pf-c-button pf-m-inline pf-m-tertiary pf-m-display-sm p pf-u-mr-md" type="button" onClick={decrementPage} disabled={isLoading || tableState.page == 0}>
              <span className="pf-c-button__icon pf-m-end">
                <i className="fas fa-arrow-left" aria-hidden="true"></i>
              </span>
              &nbsp; Previous {perpage}
            </button>
            <button className="pf-c-button pf-m-inline pf-m-tertiary pf-m-display-sm" type="button" onClick={incrementPage} disabled={isLoading || tableState.page === tableState.lastPage}>
              Next {perpage}
              <span className="pf-c-button__icon pf-m-end">
                <i className="fas fa-arrow-right" aria-hidden="true"></i>
              </span>
            </button>
          </div>
        </div>
      </div>
      { isLoading ? (
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
