import { InputGroup, InputGroupText, Spinner, TextInput } from "@patternfly/react-core";
import { FilterIcon, SearchIcon } from "@patternfly/react-icons";
import { css } from "@patternfly/react-styles";
import styles from "@patternfly/react-styles/css/components/Table/table";
import { expandable, Table, TableBody, TableHeader } from "@patternfly/react-table";
import React, { ReactNode, useEffect, useState, useReducer } from "react";
import { useHistory } from "react-router-dom";
import { AnalysisTypes } from "../../context/actions/types";
import { AppContext } from "../../context/context";
import { ISeries, StudyInstanceWithSeries } from "../../context/reducers/analyseReducer";
import ChrisIntegration from "../../services/chris_integration";
import PastAnalysisService from "../../services/pastAnalysisService";
import SeriesTable from "./seriesTable";
import { Badge } from "@patternfly/react-core";
import { calculatePatientAge } from "../../shared/utils";

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

enum TableReducerActions {
  updateMaxFeedId = "UPDATE_MAX_FEED_ID",
  addNewPage = "ADD_NEW_PAGE",
  incrementPage = "INCREMENT_PAGE",
  decrementPage = "DECREMENT_PAGE"
}

type TableState = {
  page: number,
  maxFeedId: number | undefined,
  lastOffset: number,
  lastPage: number,
  storedPages: StudyInstanceWithSeries[][]
}

type TableAction =
  | { type: TableReducerActions.updateMaxFeedId, payload: { id: number } }
  | { type: TableReducerActions.addNewPage, payload: { lastOffset: number, lastPage: number, newPage: StudyInstanceWithSeries[] } }
  | { type: TableReducerActions.incrementPage }
  | { type: TableReducerActions.decrementPage }

const tableReducer = (state: TableState, action: TableAction) => {
  switch(action.type) {
    case TableReducerActions.updateMaxFeedId:
      return {
        ...state,
        page: 0,
        maxFeedId: action.payload.id,
        lastOffset: 0,
        lastPage: -1,
        storedPages: []
      }
    case TableReducerActions.addNewPage:
      return {
        ...state,
        lastOffset: action.payload.lastOffset,
        lastPage: action.payload.lastPage,
        storedPages: [...state.storedPages, action.payload.newPage]
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

const initialTableState: TableState = {
  page: 0, // Current table page number
  maxFeedId: -1, // ID of the latest Feed on Swift as of when PastAnalysisTable first mounted OR was last reset
  lastOffset: 0, // Page offset value for where to begin fetching the next unseen page
  lastPage: -1, // Table page number of the very last page (-1 means last page has not yet been seen)
  storedPages: [] // Stores pages that have been seen in an array of pages
}

const PastAnalysisTable = () => {
  const { state: {
    prevAnalyses: { perpage, areNewImgsAvailable, listOfAnalysis },
    stagingDcmImages
  },
    dispatch } = React.useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

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
  const [newRowsRef, setNewRowsRef] = useState<string[]>([]);

  // Reset table and update the maxFeedId to the latest Feed ID in Swift
  const updateMaxFeedId = () => {
    ChrisIntegration.getLatestFeedId().then((id: number) => {
      tableDispatch({ type: TableReducerActions.updateMaxFeedId, payload: { id } });
    });
  }

  // If new past analyses are available, reset table to initial state and update maxFeedId
  useEffect(() => {
    if (areNewImgsAvailable) {
      setLoading(true);
      // Right before resetting, get a list of all the "Analysis Created" properties on page 0
      setNewRowsRef(tableState.storedPages[0]?.map((study: StudyInstanceWithSeries) => study.analysisCreated));
      updateMaxFeedId();
    }
  }, [areNewImgsAvailable])

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { maxFeedId, page, lastOffset, storedPages } = tableState;

      // Update the maxFeedId when the PastAnalysisTable first mounts
      if (maxFeedId === -1) {
        updateMaxFeedId();
        return;
      }

      if (!maxFeedId || maxFeedId >= 0) {
        // Accumulates with the rows of current page
        let curAnalyses: StudyInstanceWithSeries[] = [];

        // If current page has not yet been seen
        if (page >= storedPages.length) {
          const [newAnalyses, newOffset, isAtEndOfFeeds] = await ChrisIntegration.getPastAnalyses(lastOffset, perpage, maxFeedId);

          curAnalyses = newAnalyses;
          tableDispatch({ type: TableReducerActions.addNewPage, payload: {
            lastOffset: newOffset,
            lastPage: isAtEndOfFeeds ? page : -1,
            newPage: curAnalyses
          }});

        } else {
          // If page has already been seen, access its contents from storedPages
          curAnalyses = storedPages[page];
        }

        dispatch({
          type: AnalysisTypes.Update_list,
          payload: { list: curAnalyses }
        });
        updateRows(curAnalyses);

        dispatch({
          type: AnalysisTypes.Update_are_new_imgs_available,
          payload: { isAvailable: false }
        });
      }
      setLoading(false);
    })();
  }, [tableState, perpage, dispatch]);

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
    setNewRowsRef([]); // Reset to prevent highlight animation from playing again
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
    } else if (newRowsRef?.length > 0 && !newRowsRef.includes(cells[4])) {
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
    setNewRowsRef([]); // Reset to prevent highlight animation from playing again
    updateRows(listOfAnalysis.filter((analysis: StudyInstanceWithSeries) => analysis.dcmImage.PatientID.includes(text)))
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
