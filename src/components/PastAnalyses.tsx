import { Pagination } from "@patternfly/react-core";
import { Table, TableBody, TableHeader } from '@patternfly/react-table';
import React, { useState, useEffect } from "react";
import { AppContext } from "../context/context";
import { AnalysisTypes } from "../context/actions/types";
import ChrisIntegration from "../services/chris_integration";
import PredictionCircle from "./PredictionCircle";

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

  useEffect(() => {
    ChrisIntegration.getPastAnalaysis(page, perpage)
      .then(res => {
        dispatch({
          type: AnalysisTypes.Update_list,
          payload: {
            list: res
          }
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
  }, [page, perpage, dispatch])

  const viewImage = (imageName: any) =>{
    console.log(imageName)
  }

  //something wrong with donut-chart that caused the key error
  const rows = listOfAnalyses.map(analysis => ({
    cells: [
      {
        title: (<div>
          <div><b>{analysis.image}</b></div>
          <span className="viewImageClick" onClick={()=>viewImage(analysis.image)}>View Image</span>
        </div>)
      },
      analysis.patientMRN, analysis.createdTime, analysis.study, {
        title: (<PredictionCircle covidCircle={true} predictionNumber={analysis.predCovid} />)
      }, {
        title: (<PredictionCircle covidCircle={false} predictionNumber={analysis.predPneumonia} />)
      }, {
        title: (<PredictionCircle covidCircle={false} predictionNumber={analysis.predNormal} />)
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
        <TableBody className="anaylsisTableRow" />
      </Table>
    </React.Fragment>
  )
}

export default PastAnalysis