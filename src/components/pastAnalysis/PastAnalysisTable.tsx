import React, { useState, useEffect, ReactNode } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableVariant,
  expandable
} from '@patternfly/react-table';
import { Pagination } from '@patternfly/react-core';
import { AnalysisTypes } from '../../context/actions/types';
import { AppContext } from '../../context/context';
import ChrisIntegration from '../../services/chris_integration';
import PastAnalysisService from '../../services/pastAnalysisService';
import SeriesTable from './seriesTable';


interface tableRowsParent {
  isOpen: boolean,
  cells: string[]
}

interface tableRowsChild {
  isOpen: boolean,
  parent: number,
  fullWidth: boolean,
  cells: {[title: string]: ReactNode}[]
}

const PastAnalysisTable = () => {
  const { state: {
    prevAnalyses: { page, perpage, totalResults, areNewImgsAvailable } },
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
        const rows: (tableRowsChild | tableRowsParent)[] = []
        for (const analysis of listOfAnalyses) {
          const indexInRows: number = rows.length;
          rows.push({
            isOpen: false,
            cells: [analysis.studyDescription, analysis.patientMRN, analysis.patientDOB, `${analysis.patientAge}`, analysis.analysisCreated]
          })
          rows.push({
            isOpen: false,
            parent: indexInRows,
            fullWidth: true,
            cells: [{
              title: (<SeriesTable analysisList={analysis.series}></SeriesTable>)
            }]
          })
        }
        setRows(rows)
        // dispatch({
        //   type: AnalysisTypes.Update_list,
        //   payload: {
        //     list: res
        //   }
        // })
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

  const onCollapse = (event: any, rowKey: number, isOpen: any) => {
    /**
     * Please do not use rowKey as row index for more complex tables.
     * Rather use some kind of identifier like ID passed with each row.
     */
    const rowsCopy = [...rows]
    console.log(rowsCopy)
    rowsCopy[rowKey].isOpen = isOpen;
    setRows(rowsCopy)
  }

  return (
    <React.Fragment>
      <h2 className="PastAnalysisTitle">Past predictive analysis</h2>
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
    </React.Fragment>
  );
}

export default PastAnalysisTable;