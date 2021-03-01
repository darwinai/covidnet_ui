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

  // Stores the rows of pages that have already been visited
  const [cachedPages, setCachedPages] = useState<StudyInstanceWithSeries[][]>([]);
  
  // Stores current page number
  const [page, setPage] = useState<number>(0);

  // Stores the offset for where to begin the fetching of unseen Feeds
  const [lastOffset, setLastOffset] = useState<number>(0);

  // Stores the index of the last page in the table to prevent user from clicking next
  const [lastPage, setLastPage] = useState<number>(-1);

  // Stores the Feed ID of the latest Feed in the db when PastAnalysisTable first mounts
  const [maxFeedId, setMaxFeedId] = useState<number | undefined>(-1);

  useEffect(() => {
    (async () => {
      setLoading(true);

      // Initialize maxFeedId to the latest Feed ID
      if (maxFeedId && maxFeedId < 0) {
        setMaxFeedId(await ChrisIntegration.getLatestFeedId());
      } else {
        // Accumulates with the rows of current page
        let curAnalyses: StudyInstanceWithSeries[] = [];

        // If current page has not yet been cached
        if (page >= cachedPages.length) {
          const [newAnalyses, newOffset, isAtEndOfFeeds] = await ChrisIntegration.getPastAnalyses(lastOffset, perpage, maxFeedId);
          setLastOffset(newOffset);
          curAnalyses = newAnalyses;

          if (isAtEndOfFeeds) setLastPage(page);

          setCachedPages(cachedPages => [...cachedPages, curAnalyses]);
    
          dispatch({
            type: AnalysisTypes.Update_list,
            payload: { list: curAnalyses }
          });
        } else {
          curAnalyses = cachedPages[page];
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
  }, [maxFeedId, page, perpage, dispatch, history, areNewImgsAvailable, stagingDcmImages]);

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
    <button className="pf-c-button pf-m-inline pf-m-tertiary pf-m-display-sm" type="button" style={{marginRight: "1em"}} onClick={() => setPage(page - 1)} disabled={loading || page == 0}>
      <span className="pf-c-button__icon pf-m-end">
        <i className="fas fa-arrow-left" aria-hidden="true"></i>
      </span>
      &nbsp; Previous {perpage}
    </button>
    <button className="pf-c-button pf-m-inline pf-m-tertiary pf-m-display-sm" type="button" onClick={() => setPage(page + 1)} disabled={loading || page === lastPage}>Next {perpage}
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