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
import SeriesTable from './seriesTable';


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
    prevAnalyses: { perpage, totalResults, areNewImgsAvailable, listOfAnalysis },
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
    maxFeedId: -1, // Feed ID of the latest Feed on Swift when PastAnalysisTable first mounted OR was last reset
    lastOffset: 0, // Page offset value for where to begin fetching the next unseen page
    lastPage: -1, // Table page number of the very last page
    storedPages: [] // Stores pages that have been seen in an array of pages
  });


  // Reset table and update the maxFeedId to the latest Feed in Swift
  const updateMaxFeedId = () => {
    ChrisIntegration.getLatestFeedId().then((id: number) => {
      setTableStates({
        page: 0,
        maxFeedId: id,
        lastOffset: 0,
        lastPage: -1,
        storedPages: []
      })
    })
  }

  // Reset table and update the maxFeedId when the table mounts
  useEffect(() => {
    updateMaxFeedId();
  }, []);

  // If new past analyses are available, reset table to initial state and update maxFeedId
  useEffect(() => {
    if (areNewImgsAvailable) {
      setLoading(true);
      updateMaxFeedId();
    }
  }, [areNewImgsAvailable])
  
  useEffect(() => {
    (async () => {
      setLoading(true);
      const {maxFeedId, page, lastOffset, storedPages} = tableStates;
      
      // Initialize maxFeedId to the latest Feed ID
      if (!maxFeedId || maxFeedId >= 0) {
        // Accumulates with the rows of current page
        let curAnalyses: StudyInstanceWithSeries[] = [];

        // If current page has not yet been seen
        if (page >= storedPages.length) {
          const [newAnalyses, newOffset, isAtEndOfFeeds] = await ChrisIntegration.getPastAnalyses(lastOffset, perpage, maxFeedId);
          
          setTableStates(prevTableStates => ({
            ...prevTableStates,
            lastOffset: newOffset
          }));

          // If after fetching, the end of Feeds on Swift has been reached, 
          // record the current page as the last page to prevent further navigation
          if (isAtEndOfFeeds) {
            setTableStates(prevTableStates => ({
              ...prevTableStates,
              lastPage: page
            }));
          }

          curAnalyses = newAnalyses;
          setTableStates(prevTableStates => ({
            ...prevTableStates,
            storedPages: [...prevTableStates.storedPages, curAnalyses]
          }));
        } else {
          // If page has already been seen, access its contents from storedPages
          curAnalyses = storedPages[page];
        }

        dispatch({
          type: AnalysisTypes.Update_list,
          payload: { list: curAnalyses }
        });

        const imagesAnalyzing: StudyInstanceWithSeries[] = PastAnalysisService.groupDcmImagesToStudyInstances(stagingDcmImages);
        updateRows(imagesAnalyzing.concat(curAnalyses))
        dispatch({
          type: AnalysisTypes.Update_are_new_imgs_available,
          payload: { isAvailable: false }
        });
      }
      setLoading(false);
    })();
  }, [tableStates.maxFeedId, tableStates.page, perpage, dispatch, history, stagingDcmImages]);

  const updatePage = (n: number) => {
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
        `${analysis.dcmImage.PatientAge}`,
        analysis.analysisCreated
      ];
      if (cells[cells.length - 1] === Processing.analysisAreProcessing) {
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
            title: (<SeriesTable studyInstance={analysis}></SeriesTable>)
          }]
        })
      }
    }
    setRows(rows)
  }

  const onCollapse = (event: any, rowKey: number, isOpen: any) => {
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
    const backgroundStyle = { 'backgroundColor': `${isAnalyzing ? '#F9E0A2' : '#FFFFFF'}` };
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
      
    <div style={{float: "right"}}>
    <button className="pf-c-button pf-m-inline pf-m-tertiary pf-m-display-sm" type="button" style={{marginRight: "1em"}} onClick={() => updatePage(-1)} disabled={loading || tableStates.page == 0}>
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
          ) : 
          ( 
            <>
          <Table aria-label="Collapsible table" id="pastAnalysisTable"
            onCollapse={onCollapse} rows={rows} cells={columns}
            rowWrapper={customRowWrapper}
            >
            <TableHeader />
            <TableBody />
          </Table>
          </>
          )
    }
    </div>
  );
}

export default PastAnalysisTable;