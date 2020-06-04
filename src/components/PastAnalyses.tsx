import { Pagination } from "@patternfly/react-core";
import { Table, TableBody, TableHeader } from '@patternfly/react-table';
import React, { useState } from "react";
import { ChartDonutUtilization } from '@patternfly/react-charts';
import { AppContext } from "../context/context";
import { AnalysisTypes } from "../context/actions/types";

const PastAnalysis = () => {
  const { state, dispatch } = React.useContext(AppContext);
  const { prevAnalyses } = state;
  const { page, perpage, listOfAnalyses, totalResults } = prevAnalyses;
  const columns = [
    { title: (<span>Image<br /><span className='classificationText'>&nbsp;</span></span>) },
    { title: (<span>Patient MRN<br /><span className='classificationText'>&nbsp;</span></span>) },
    { title: (<span>Created<br /><span className='classificationText'>&nbsp;</span></span>) },
    { title: (<span>Study<br /><span className='classificationText'>&nbsp;</span></span>) },
    { title: (<span>Predictions<br /><span className='classificationText'>COVID-19</span></span>) },
    { title: (<span><br /><span className='classificationText'>Pneumonia</span></span>) },
    { title: (<span><br /><span className='classificationText'>Normal</span></span>) }
  ]


  const rows = listOfAnalyses.map(analysis => ({
    cells: [
      { title: <div>{analysis.image} </div> },
      analysis.patientMRN, analysis.createdTime, analysis.study, {
        title: (
          <div style={{ height: '80px', width: '80px' }}>
            <ChartDonutUtilization
              ariaDesc="Storage capacity"
              constrainToVisibleArea={true}
              data={{ x: 'Prediction', y: analysis.predCovid }}
              height={400}
              innerRadius={0}
              padding={0}
              title={`${analysis.predCovid}%`}
              thresholds={[{ value: 60 }, { value: 90 }]}
              width={400}
            />
          </div>
        )
      }, {
        title: (
          <div style={{ height: '80px', width: '80px' }}>
            <ChartDonutUtilization
              ariaDesc="Storage capacity"
              constrainToVisibleArea={true}
              data={{ x: 'Prediction', y: analysis.predPneumonia }}
              height={400}
              innerRadius={0}
              padding={0}
              title={`${analysis.predPneumonia}%`}
              thresholds={[{ value: 60 }, { value: 90 }]}
              width={435}
            />
          </div>
        )
      }, {
        title: (
          <div style={{ height: '80px', width: '80px' }}>
            <ChartDonutUtilization
              ariaDesc="Storage capacity"
              constrainToVisibleArea={true}
              data={{ x: 'Prediction', y: analysis.predNormal }}
              height={400}
              innerRadius={0}
              padding={0}
              title={`${analysis.predNormal}%`}
              thresholds={[{ value: 60 }, { value: 90 }]}
              width={435}
            />
          </div>
        )
      }]
  }))

  return (
    <React.Fragment>
      <h2>Past predicative analyses</h2>
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
      <Table aria-label="Simple Table" cells={columns} rows={rows}>
        <TableHeader />
        <TableBody />
      </Table>
    </React.Fragment>
  )
}

export default PastAnalysis