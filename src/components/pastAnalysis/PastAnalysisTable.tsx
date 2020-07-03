import { InputGroup, InputGroupText, Pagination, TextInput } from '@patternfly/react-core';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';
import { expandable, Table, TableBody, TableHeader } from '@patternfly/react-table';
import React, { ReactNode, useEffect, useState } from 'react';
import { AnalysisTypes } from '../../context/actions/types';
import { AppContext } from '../../context/context';
import ChrisIntegration from '../../services/chris_integration';
import PastAnalysisService from '../../services/pastAnalysisService';
import SeriesTable from './seriesTable';
import { StudyInstanceWithSeries } from '../../context/reducers/analyseReducer'


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
    prevAnalyses: { page, perpage, totalResults, areNewImgsAvailable, listOfAnalysis } },
    dispatch } = React.useContext(AppContext);

  const columns = [
    {
      title: 'Study',
      cellFormatters: [expandable]
    },
    'Patient MRN', 'Patient DOB', 'Patient Age', 'Analysis Created'
  ]
  const [rows, setRows] = useState<(tableRowsChild | tableRowsParent)[]>([])

  useEffect(() => {
    PastAnalysisService.groupIAnalysisToStudyGroups(page, perpage)
      .then(listOfAnalyses => {
        dispatch({
          type: AnalysisTypes.Update_list,
          payload: {
            list: listOfAnalyses
          }
        })
        updateRows(listOfAnalyses)
        dispatch({
          type: AnalysisTypes.Update_are_new_imgs_available,
          payload: { isAvailable: false }
        })
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
  }, [page, perpage, dispatch, areNewImgsAvailable])

  const updateRows = (listOfAnalysis: StudyInstanceWithSeries[]) => {
    const rows: (tableRowsChild | tableRowsParent)[] = []
    for (const analysis of listOfAnalysis) {
      const indexInRows: number = rows.length;
      rows.push({
        isOpen: false,
        cells: [
          analysis.dcmImage.StudyDescription,
          analysis.dcmImage.PatientID,
          analysis.dcmImage.PatientBirthDate,
          `${analysis.dcmImage.PatientAge}`,
          analysis.analysisCreated]
      })
      rows.push({
        isOpen: false,
        parent: indexInRows,
        fullWidth: true,
        cells: [{
          title: (<SeriesTable studyInstance={analysis}></SeriesTable>)
        }]
      })
    }
    setRows(rows)
  }

  const onCollapse = (event: any, rowKey: number, isOpen: any) => {
    /**
     * Please do not use rowKey as row index for more complex tables.
     * Rather use some kind of identifier like ID passed with each row.
     */
    const rowsCopy = [...rows]
    rowsCopy[rowKey].isOpen = isOpen;
    setRows(rowsCopy)
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
        onPerPageSelect={(_event, perPage) => dispatch({
          type: AnalysisTypes.Update_perpage,
          payload: { page: perPage }
        })}
      />
      <Table aria-label="Collapsible table" onCollapse={onCollapse} rows={rows} cells={columns}>
        <TableHeader />
        <TableBody />
      </Table>
    </div>
  );
}

export default PastAnalysisTable;