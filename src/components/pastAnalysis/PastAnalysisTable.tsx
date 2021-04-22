import { InputGroup, InputGroupText, Spinner, TextInput } from "@patternfly/react-core";
import { FilterIcon, SearchIcon } from "@patternfly/react-icons";
import { css } from "@patternfly/react-styles";
import styles from "@patternfly/react-styles/css/components/Table/table";
import { expandable, Table, TableBody, TableHeader } from "@patternfly/react-table";
import React, { ReactNode, useEffect, useState, useReducer, useRef } from "react";
import { NotificationActionTypes } from "../../context/actions/types";
import { AppContext } from "../../context/context";
import { TStudyInstance } from "../../context/reducers/analyseReducer";
import ChrisIntegration, { pluginData, TAnalysisResults, PluginPollStatus } from "../../services/chris_integration";
import SeriesTable from "./seriesTable";
import { Badge } from "@patternfly/react-core";
import { calculatePatientAge } from "../../shared/utils";
import useInterval from "../../shared/useInterval";
import { RESULT_POLL_INTERVAL } from "../../app.config";
import { debounce } from "lodash";
import { NotificationItem, NotificationItemVariant } from "../../context/reducers/notificationReducer";
import moment from "moment";

interface tableRowsParent {
  isOpen: boolean,
  cells: string[],
  analysis: TStudyInstance,
  isProcessing: boolean
}

interface tableRowsChild {
  parent: number,
  fullWidth: boolean,
  cells: { [title: string]: ReactNode }[]
}

type TableState = {
  page: number, // Current table page number
  maxFeedId: number | undefined, // ID of the latest Feed on ChRIS as of when PastAnalysisTable first mounted OR was last reset
  lastOffset: number, // Page offset value for where to begin fetching the next unseen page
  lastPage: number, // Table page number of the very last page (-1 means last page has not yet been seen)
  storedPages: TStudyInstance[][], // Stores pages that have been seen, in an array of pages
  processingFeedIds: number[] // Stores Feed IDs associated with images that are currently processing
  filter: string // Patient MRN filter
}

const INITIAL_TABLE_STATE: TableState = {
  page: 0,
  maxFeedId: -1,
  lastOffset: 0,
  lastPage: -1,
  storedPages: [],
  processingFeedIds: [],
  filter: ""
}

enum TableReducerActions {
  UPDATE_MAX_FEED_ID = "UPDATE_MAX_FEED_ID",
  ADD_NEW_PAGE = "ADD_NEW_PAGE",
  INCREMENT_PAGE = "INCREMENT_PAGE",
  DECREMENT_PAGE = "DECREMENT_PAGE",
  UPDATE_PROCESSING_FEED_IDS = "UPDATE_PROCESSING_FEED_IDS",
  SET_FITLER = "SET_FITLER"
}

type TableAction =
  | { type: TableReducerActions.UPDATE_MAX_FEED_ID, payload: { id: number } }
  | { type: TableReducerActions.ADD_NEW_PAGE, payload: { lastOffset: number, lastPage: number, newPage: TStudyInstance[], processingFeedIds: number[] } }
  | { type: TableReducerActions.INCREMENT_PAGE }
  | { type: TableReducerActions.DECREMENT_PAGE }
  | { type: TableReducerActions.UPDATE_PROCESSING_FEED_IDS, payload: { processingFeedIds: number[] } }
  | { type: TableReducerActions.SET_FITLER, payload: { filter: string } };;

const tableReducer = (state: TableState, action: TableAction): TableState => {
  switch (action.type) {
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
        processingFeedIds: [...state.processingFeedIds, ...action.payload.processingFeedIds]
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
    case TableReducerActions.UPDATE_PROCESSING_FEED_IDS:
      return {
        ...state,
        processingFeedIds: action.payload.processingFeedIds
      }
    case TableReducerActions.SET_FITLER:
      return {
        ...INITIAL_TABLE_STATE,
        maxFeedId: state.maxFeedId,
        filter: action.payload.filter
      }
    default: return state;
  }
}

// Type guard for checking if a table row is a parent row
const isParentRow = (row: tableRowsParent | tableRowsChild): row is tableRowsParent => (
  (row as tableRowsParent).isOpen !== undefined &&
  (row as tableRowsParent).analysis !== undefined &&
  (row as tableRowsParent).isProcessing !== undefined
)

const PastAnalysisTable: React.FC = () => {
  const { state: { prevAnalyses: { perpage } }, dispatch } = React.useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);

  const [tableState, tableDispatch] = useReducer(tableReducer, INITIAL_TABLE_STATE);

  const columns = [
    {
      title: "Study",
      cellFormatters: [expandable]
    },
    "Study Date", "Patient MRN", "Patient DOB", "Analysis Created", ""
  ]
  const [rows, setRows] = useState<(tableRowsChild | tableRowsParent)[]>([])

  // Stores an array of the "Analysis Created" property of the rows of page 0 of the table
  // Used to identify which rows are new and need to be highlighted green
  const newRowsRef = useRef<string[]>([]);

  // Reset table and update the maxFeedId to the latest Feed ID in Swift
  const updateMaxFeedId = async () => {
    const id: number = await ChrisIntegration.getLatestFeedId();
    tableDispatch({ type: TableReducerActions.UPDATE_MAX_FEED_ID, payload: { id } });
  }

  useEffect(() => {
    updateMaxFeedId();
  }, [])

  useEffect(() => {
    (async () => {
      const { maxFeedId, page, lastOffset, storedPages, filter } = tableState;

      if (!maxFeedId || maxFeedId >= 0) {
        setIsLoading(true);
        let curAnalyses: TStudyInstance[] = [];

        // If current page has not yet been seen and is not the last page
        if (page >= storedPages.length) {
          const [newAnalyses, newOffset, isAtEndOfFeeds] = await ChrisIntegration.getPastAnalyses(lastOffset, perpage, filter, maxFeedId);

          // Extracts the Feed IDs associated with studies that are processing
          const processingFeedIds = newAnalyses.filter((study: TStudyInstance) => !!study.pluginStatuses.jobsRunning)
          .flatMap((study: TStudyInstance) => study.feedIds);

          tableDispatch({ type: TableReducerActions.ADD_NEW_PAGE, payload: {
            lastOffset: newOffset,
            lastPage: isAtEndOfFeeds ? page : -1,
            newPage: newAnalyses,
            processingFeedIds: processingFeedIds.filter((id: number) => !tableState.processingFeedIds.includes(id))
          }});
          curAnalyses = newAnalyses;
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
    const finishedFeeds = (await Promise.all(tableState.processingFeedIds.map(async (id: number) => {
      if (await ChrisIntegration.checkIfFeedJobsCompleted(id)) {
        return [id];
      } else {
        return [];
      }
    }))).flat();

    let notifications: NotificationItem[] = await Promise.all(finishedFeeds.map(async (id: number) => {
      const notificationInfo: pluginData = await ChrisIntegration.getCovidnetPluginData(id);
      if (notificationInfo.status !== PluginPollStatus.SUCCESS) {
        return ({
          variant: NotificationItemVariant.DANGER,
          title: `Analysis of image '${notificationInfo.title.split('/').pop()}' failed`,
          message: `During the analysis, the following error was raised:
                    ${notificationInfo.pluginName} failed.`,
          timestamp: moment()
        });
      } else {
        return ({
          variant: NotificationItemVariant.SUCCESS,
          title: `Analysis of image '${notificationInfo.title.split('/').pop()}' finished`,
          message: `The image was processed successfully.`,
          timestamp: moment(),
          feedId: id
        });
      }
    }));

    if (finishedFeeds.length) {
      dispatch({
        type: NotificationActionTypes.SEND,
        payload: { notifications }
      });

      const updatedProcessingFeedIds = tableState.processingFeedIds.filter((id: number) => {
        return !finishedFeeds.includes(id);
      });
  
      // Right before refreshing table, get a list of all the "Analysis Created" properties on page 0
      newRowsRef.current = tableState.storedPages[0].filter((study: TStudyInstance) => !study.pluginStatuses.jobsRunning).map((study: TStudyInstance) => study.analysisCreated);

      tableDispatch({
        type: TableReducerActions.UPDATE_PROCESSING_FEED_IDS,
        payload: { processingFeedIds: updatedProcessingFeedIds }
      });
  
      updateMaxFeedId();
    }
  }, tableState.processingFeedIds.length ? RESULT_POLL_INTERVAL : 0); // Pauses polling if there are no processing rows

  const updateRows = (listOfAnalyses: TStudyInstance[]) => {
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
            {<Badge className="badge-margin" isRead={!analysis.feedIds.length}>{analysis.feedIds.length}</Badge>}
            {<Badge className="badge-danger" isRead={!analysis.pluginStatuses.jobsErrored}>{analysis.pluginStatuses.jobsErrored}</Badge>}
          </>)
        };
      }

      const cells: any[] = [
        analysis.dcmImage.StudyDescription,
        analysis.dcmImage.StudyDate,
        analysis.dcmImage.PatientID,
        `${analysis.dcmImage.PatientBirthDate} (${calculatePatientAge(analysis.dcmImage.PatientBirthDate)}y)`,
        analysisCreated,
        badges
      ];

      // Top-level row
      newRows.push({
        isOpen: false,
        cells: cells,
        analysis,
        isProcessing
      });

      // Blank nested row
      if (analysis.feedIds.length > 0) {
        newRows.push({
          isOpen: false,
          parent: indexInRows,
          fullWidth: true,
          cells: []
        });
      }
    }
    setRows(newRows);
  }

  const onCollapse = async (event: any, rowKey: number, isOpen: any) => {
    newRowsRef.current = []; // Reset to prevent highlight animation from playing again
    const rowsCopy = [...rows];
    
    const parentRow = rowsCopy[rowKey];
    if (isParentRow(parentRow)) {
      parentRow.isOpen = isOpen;
      if (isOpen && rowsCopy[rowKey + 1].cells.length === 0) {
        const data: Promise<TAnalysisResults> = ChrisIntegration.getResultsAndClassesFromFeedIds(parentRow.analysis.feedIds);

        const isProcessing = parentRow.isProcessing;
    
        rowsCopy[rowKey] = parentRow;

        rowsCopy[rowKey + 1] = {
          isOpen: false,
          parent: rowKey,
          fullWidth: true,
          cells: [{
            title: (<SeriesTable data={data} dcmImage={parentRow.analysis.dcmImage} isProcessing={isProcessing}></SeriesTable>)
          }]
        }
      }
      setRows(rowsCopy);
    }
  }

  const customRowWrapper = (tableRow: any) => {
    const {
      trRef,
      className,
      rowProps,
      row: { isExpanded, cells },
      ...props
    } = tableRow;


    const analysisCreated = cells[4] // 4 is the index of Analysis Created column
    const isAnalyzing: boolean = analysisCreated && analysisCreated.title;
    // Style the current row
    let backgroundStyle = {};
    if (isAnalyzing) {
      backgroundStyle = { "backgroundColor": "#F9E0A2" }; // Processing rows
    } else if (newRowsRef.current?.length > 0 && !newRowsRef.current.includes(analysisCreated)) {
      backgroundStyle = { "animation": "new-row-highlight-animation 2s linear" }; // Newly added rows
      newRowsRef.current = [...newRowsRef.current, analysisCreated];
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

  const debouncedFilterUpdate = debounce((filter: string) => tableDispatch({
    type: TableReducerActions.SET_FITLER,
    payload: { filter }
  }), 500);

  const searchMRN = (filter: string) => {
    newRowsRef.current = []; // Reset to prevent highlight animation from playing again
    debouncedFilterUpdate(filter);
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
        <h2 className="PastAnalysisTitle">Past predictive analyses</h2>
        <div className="flex-row-space-between">
          <div className="MRNsearchBar">
            <InputGroup>
              <InputGroupText>
                <FilterIcon />
              </InputGroupText>
              <TextInput id="textInput5" type="text" placeholder="Patient MRN" aria-label="Dollar amount input example" onChange={searchMRN} />
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
