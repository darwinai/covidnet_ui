import { Pagination } from "@patternfly/react-core";
import { Table, TableBody, TableHeader } from '@patternfly/react-table';
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { AnalysisTypes } from "../context/actions/types";
import { AppContext } from "../context/context";
import { IAnalysis } from '../context/reducers/analyseReducer';
import ChrisIntegration from "../services/chris_integration";
import DicomViewerService from "../services/dicomViewerService";
import PredictionCircle from "./PredictionCircle";

const PastAnalysis = () => {
  const { state: { prevAnalyses: { page, perpage, listOfAnalyses, totalResults, areNewImgsAvailable } }, dispatch } = React.useContext(AppContext);
  const history = useHistory();
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
  }, [page, perpage, dispatch, areNewImgsAvailable])

  const viewImage = (analysis: IAnalysis) => {
    DicomViewerService.fetchImageFile(analysis.imageId)
    dispatch({
      type: AnalysisTypes.Update_selected_image,
      payload: { selectedImage: analysis }
    })
    history.push('/viewImage')
  }

  //something wrong with donut-chart that caused the key error
  const rows = listOfAnalyses.map(analysis => ({
    cells: [
      {
        title: (<div>
          <div><b>{analysis.image.split('/').pop()}</b></div>
          <span className="viewImageClick" onClick={() => viewImage(analysis)}>View Image</span>
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
      <h2 className="PastAnalysisTitle">Past predicative analyses</h2>
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