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
import CreateAnalysisService from "../../services/CreateAnalysisService";
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
    prevAnalyses: { page, perpage, totalResults, areNewImgsAvailable, listOfAnalysis },
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

  useEffect(() => {
    setLoading(true);
    ChrisIntegration.getPastAnalysis(page, perpage)
      .then(listOfAnalyses => {
        dispatch({
          type: AnalysisTypes.Update_list,
          payload: { list: listOfAnalyses }
        });
        const imagesAnalyzing: StudyInstanceWithSeries[] = PastAnalysisService.groupDcmImagesToStudyInstances(stagingDcmImages);
        updateRows(imagesAnalyzing.concat(listOfAnalyses))
        dispatch({
          type: AnalysisTypes.Update_are_new_imgs_available,
          payload: { isAvailable: false }
        })
        setLoading(false);
      })
      .catch(err => {
        if (err.response.data.includes('Authentication credentials')) {
          history.push('/login')
        }
      })
    ChrisIntegration.getTotalAnalyses()
      .then(total => {
        dispatch({
          type: AnalysisTypes.Update_total,
          payload: {
            total: total
          }
        })
      })
  }, [page, perpage, dispatch, history, areNewImgsAvailable, stagingDcmImages]);

  const updateRows = (listOfAnalysis: StudyInstanceWithSeries[]) => {
    const rows: (tableRowsChild | tableRowsParent)[] = []
    for (const analysis of listOfAnalysis) {
      const indexInRows: number = rows.length;
      const cells: any[] = [
        analysis.dcmImage.StudyDescription,
        analysis.dcmImage.PatientID,
        analysis.dcmImage.PatientBirthDate,
        `${CreateAnalysisService.calculatePatientAge(analysis.dcmImage.PatientBirthDate)}`,
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
      <Pagination
        itemCount={totalResults}
        perPage={perpage}
        page={page}
        onSetPage={(_event, pageNumber) => dispatch({
          type: AnalysisTypes.Update_page,
          payload: { page: pageNumber }
        })}
        widgetId="pagination-options-menu-top"
        onPerPageSelect={(_event, perPageValue) => dispatch({
          type: AnalysisTypes.Update_perpage,
          payload: { perpage: perPageValue }
        })}
      />
      <Table aria-label="Collapsible table" id="pastAnalysisTable"
        onCollapse={onCollapse} rows={rows} cells={columns}
        rowWrapper={customRowWrapper}
      >
        <TableHeader />
        <TableBody />
      </Table>
      {loading && <div className="loading">
        <Spinner size="xl" /> &nbsp; Loading
      </div>}
    </div>
  );
}

export default PastAnalysisTable;