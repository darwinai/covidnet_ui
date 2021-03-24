import { InputGroup, InputGroupText, Pagination, Spinner, TextInput } from '@patternfly/react-core';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Table/table';
import { expandable, Table, TableBody, TableHeader } from '@patternfly/react-table';
import React, { ReactNode, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { AnalysisTypes } from '../../context/actions/types';
import { AppContext } from '../../context/context';
import { StudyInstanceWithSeries } from '../../context/reducers/analyseReducer';
import ChrisIntegration from '../../services/chris_integration';
import PastAnalysisService, { Processing } from '../../services/pastAnalysisService';
import SeriesTable from "./seriesTable";
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

interface TableStates {
  page: number,
  maxFeedId: number | undefined,
  lastOffset: number,
  lastPage: number,
  storedPages: StudyInstanceWithSeries[][]
}

const PastAnalysisTable = () => {
  const { state: {
    prevAnalyses: { perpage, areNewImgsAvailable, listOfAnalysis },
    stagingDcmImages
  },
    dispatch } = React.useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  const columns = [
    {
      title: 'Study',
      cellFormatters: [expandable]
    },
    'Patient MRN', 'Patient DOB', 'Patient Age', 'Analysis Created'
  ]
  const [rows, setRows] = useState<(tableRowsChild | tableRowsParent)[]>([])

  // Stores properties of the table used for pagination
  const [tableStates, setTableStates] = useState<TableStates>({
    page: 0, // Current table page number
    maxFeedId: -1, // ID of the latest Feed on Swift as of when PastAnalysisTable first mounted OR was last reset
    lastOffset: 0, // Page offset value for where to begin fetching the next unseen page
    lastPage: -1, // Table page number of the very last page (-1 means last page has not yet been seen)
    storedPages: [] // Stores pages that have been seen in an array of pages
  });

  // Stores an array of the "Analysis Created" property of the rows of page 0 of the table
  // Used to identify which rows are new and need to be highlighted green
  const [newRowsRef, setNewRowsRef] = useState<string[]>([]);

  // Reset table and update the maxFeedId to the latest Feed ID in Swift
  const updateMaxFeedId = () => {
    ChrisIntegration.getLatestFeedId().then((id: number) => {
      setTableStates({
        page: 0,
        maxFeedId: id,
        lastOffset: 0,
        lastPage: -1,
        storedPages: []
      });
    });
  }

  // If new past analyses are available, reset table to initial state and update maxFeedId
  useEffect(() => {
    if (areNewImgsAvailable) {
      setLoading(true);
      // Right before resetting, get a list of all the "Analysis Created" properties on page 0
      setNewRowsRef(tableStates.storedPages[0]?.map((study: StudyInstanceWithSeries) => study.analysisCreated));
      updateMaxFeedId();
    }
  }, [areNewImgsAvailable])

  useEffect(() => {
    let isMounted = true;

    (async () => {
      setLoading(true);
      const { maxFeedId, page, lastOffset, storedPages } = tableStates;

      // Update the maxFeedId when the PastAnalysisTable first mounts
      if (maxFeedId === -1) {
        updateMaxFeedId();
        return;
      }

      // Get rows for analysis currently processing
      const imagesAnalyzing: StudyInstanceWithSeries[] = PastAnalysisService.groupDcmImagesToStudyInstances(stagingDcmImages);
      const numAnalyzing = imagesAnalyzing.length;

      // Calculate number of past analysis rows to fetch, given the number of processing rows to display on current page
      let fetchSize;
      if (Math.floor(numAnalyzing / perpage) > page) { // There are enough processing rows to fill entire page, so don't fetch any past results
        fetchSize = 0;
      } else if (Math.floor(numAnalyzing / perpage) === page) { // Processing rows partially fill the page, fill rest of page with past results
        fetchSize = perpage - (numAnalyzing % perpage);
      } else { // No processing rows on current page, fill entire page with past results
        fetchSize = perpage;
      }
      // Slice the array of processing rows to display on current page
      const processingRows = imagesAnalyzing.slice(page * perpage, (page + 1) * perpage);

      if (isMounted) {
        if (!maxFeedId || maxFeedId >= 0) {
          // Accumulates with the rows of current page
          let curAnalyses: StudyInstanceWithSeries[] = [];

          // If current page has not yet been seen
          if (page >= storedPages.length) {
            const [newAnalyses, newOffset, isAtEndOfFeeds] = await ChrisIntegration.getPastAnalyses(lastOffset, fetchSize, maxFeedId);

            // Update latest offset
            if (isMounted) {
              setTableStates(prevTableStates => ({
                ...prevTableStates,
                lastOffset: newOffset
              }));
            }

            // If the end of Feeds on Swift has been reached, record the current page as the last page to prevent further navigation by user
            if (isAtEndOfFeeds) {
              if (isMounted) {
                setTableStates(prevTableStates => ({
                  ...prevTableStates,
                  lastPage: page
                }));
              }
            }

            // Append processing rows to fetched results rows and update storedPages
            curAnalyses = processingRows.concat(newAnalyses);
            if (isMounted) {
              setTableStates(prevTableStates => ({
                ...prevTableStates,
                storedPages: [...prevTableStates.storedPages, curAnalyses]
              }));
            }
          } else {
            // If page has already been seen, access its contents from storedPages
            curAnalyses = storedPages[page];
          }
          if (isMounted) {
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
        }
        if (isMounted) {
          setLoading(false);
        }
      }

    })();

    return () => {
      isMounted = false;
    };
  }, [tableStates.maxFeedId, tableStates.page, perpage, dispatch, history, stagingDcmImages]);

  // Increments or decrements current page number
  const updatePage = (n: number) => {
    setNewRowsRef([]); // Reset to prevent highlight animation from playing again
    setTableStates(prevTableStates => ({
      ...prevTableStates,
      page: prevTableStates.page + n
    }));
  }

  const updateRows = (listOfAnalysis: StudyInstanceWithSeries[]) => {
    const rows: (tableRowsChild | tableRowsParent)[] = []
    for (const analysis of listOfAnalysis) {
      const indexInRows: number = rows.length;
      const cells: any[] = [
        analysis.dcmImage.StudyDescription,
        analysis.dcmImage.PatientID,
        analysis.dcmImage.PatientBirthDate,
        `${calculatePatientAge(analysis.dcmImage.PatientBirthDate)}y`,
        analysis.analysisCreated
      ];

      const isProcessing = cells[cells.length - 1] === Processing.analysisAreProcessing;
      if (isProcessing) {
        cells[cells.length - 1] = {
          title: (<div><Spinner size="md" /> Processing</div>)
        }
      }
      rows.push({
        isOpen: false,
        cells: cells
      })
      if (analysis.series.length > 0) {
        rows.push({
          isOpen: false,
          parent: indexInRows,
          fullWidth: true,
          cells: [{
            title: (<SeriesTable studyInstance={analysis} isProcessing={isProcessing}></SeriesTable>)
          }]
        })
      }
    }
    setRows(rows)
  }

  const onCollapse = (event: any, rowKey: number, isOpen: any) => {
    setNewRowsRef([]); // Reset to prevent highlight animation from playing again
    const rowsCopy = [...rows]
    rowsCopy[rowKey].isOpen = isOpen;
    setRows(rowsCopy)
  }

  const customRowWrapper = (tableRow: any) => {
    const {
      trRef,
      className,
      rowProps,
      row: { isExpanded, cells },
      ...props
    } = tableRow;

    const isAnalyzing: boolean = cells[4] && cells[4].title; // 4 is the last index in row

    // Style the current row
    let backgroundStyle = {};
    if (isAnalyzing) {
      backgroundStyle = { 'backgroundColor': '#F9E0A2' }; // Processing rows
    } else if (newRowsRef?.length > 0 && !newRowsRef.includes(cells[4])) {
      backgroundStyle = { 'animation': 'new-row-highlight-animation 2s linear' }; // Newly added rows
    } else {
      backgroundStyle = { 'backgroundColor': '#FFFFFF' }; // Default
    }

    return (
      <tr
        {...props}
        ref={trRef}
        className={css(
          className,
          'custom-static-class',
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
        <button className="pf-c-button pf-m-inline pf-m-tertiary pf-m-display-sm" type="button" style={{ marginRight: "1em" }} onClick={() => updatePage(-1)} disabled={loading || tableStates.page == 0}>
          <span className="pf-c-button__icon pf-m-end">
            <i className="fas fa-arrow-left" aria-hidden="true"></i>
          </span>
      &nbsp; Previous {perpage}
        </button>
        <button className="pf-c-button pf-m-inline pf-m-tertiary pf-m-display-sm" type="button" onClick={() => updatePage(1)} disabled={loading || tableStates.page === tableStates.lastPage}>Next {perpage}
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
