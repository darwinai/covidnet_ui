import React, { useContext } from "react";
import { ImageViewerTypes } from "../../context/actions/types";
import { AppContext } from "../../context/context";
import { ISeries } from "../../context/reducers/analyseReducer";
import CreateAnalysisService from "../../services/CreateAnalysisService";
import { isLargestNumber } from "../pastAnalysis/seriesTable";
import PredictionCircle from '../PredictionCircle';

const DicomViewerBottomBox = () => {
  const { state: { imgViewer: { isBottomHided }, prevAnalyses: { selectedImage } }, dispatch } = useContext(AppContext)

  const toggle = () => {
    dispatch({
      type: ImageViewerTypes.Update_is_bottom_hidded,
      payload: { isBottomHided: !isBottomHided }
    })
  }

  const geoOpacityNumbers = (
    dcmImage: ISeries | null | undefined,
    geoOpacity: 'geographic' | 'opacity',
    type: 'severity' | 'extentScore'
  ): string => {
    if (!dcmImage) return 'unavailable';
    if (!dcmImage[geoOpacity]) return 'N/A';
    if (type === 'severity') return `${dcmImage[geoOpacity]?.severity}%`
    else return `${dcmImage[geoOpacity]?.extentScore}`
  }

  //2018 01 05 2y 6m
  const { studyInstance, index } = selectedImage;
  let imageDetail = studyInstance?.series[index];

  const generateBottomDisplay = (series?: ISeries) => {
    if (!series) {
      return;
    }

    return ( // Dynamically generate the titles to display for the classifications
      Object.keys(series.columnNames).map((value: string, index: number) => {
        <p key={value}>{value}: <span className="blueText">{series.columnValues[index]}</span></p>
      })
    )
  }

  const generateDisplayCircles = (series?: ISeries) => {
    if (!series) {
      return;
    } 
    
    return ( // Dynamically display the prediction classes/values in the dicomviewerbottombox
      Object.keys(series.columnNames).map((value: string, index: number) => {
        <div className="PredictionArea" key={value}>
                <PredictionCircle largeCircle={isLargestNumber(series.columnValues[index], series.columnValues)}
                  predictionNumber={series.columnValues[index]}/>
                <div className="topMargin">{series.columnNames[index]}</div>
              </div>
      })
    )
  }

  return (
    <div id="ViewerbottomBox"
      className={`flex_col dicomViewerBottomBox ${!isBottomHided ? 'expandedBottom' : 'collapsedBottom'}`}>
      <div className="hideButton">
        <div className='predictionValues moveUp'>

          {generateBottomDisplay(imageDetail)}
        
        </div>
        <span className="pointer" onClick={toggle}>{!isBottomHided ? 'hide ' : 'expand '}</span>	&nbsp;
        <span className="pointer" onClick={toggle}>
          {!isBottomHided ? (<i className="fas fa-angle-down"></i>) : (<i className="fas fa-angle-up"></i>)}
        </span>
      </div>
      <div className={`flex_row bottomInfoBox ${!isBottomHided ? '' : 'displayNone'}`}>
        <div className="padding-l-2rem">
          <h2><span><i className="pf-icon pf-icon-info"></i></span></h2>
        </div>
        <div className="padding-l-2rem">
          <h2>{studyInstance?.dcmImage.PatientName}</h2>
          <p><span>MRN</span> #{studyInstance?.dcmImage.PatientID}</p>
          <p><span>DOB</span> {studyInstance?.dcmImage.PatientBirthDate}</p>
          <p><span>GENDER</span> {studyInstance ? CreateAnalysisService.formatGender(studyInstance.dcmImage.PatientSex) : ''}</p>
        </div>
        <div className="padding-l-2rem">
          <h2>{studyInstance?.dcmImage.StudyDescription}</h2>
          <p><span>DATE</span> {studyInstance?.analysisCreated}</p>
          <p><span>AETITLE</span> Station1234</p>
          <p><span>MODALITY</span> XRAY</p>
        </div>
        <div className="predictions padding-l-2rem">
          <span className='logo-text'>COVID-Net</span>
          <div className="flex_row">
          
            {generateDisplayCircles(imageDetail)}

            <div className="padding-l-2rem">
              <p><span>GEOGRAPHIC SEVERITY</span>&nbsp;{geoOpacityNumbers(imageDetail, 'geographic', 'severity')}</p>
              <p><span>GEOGRAPHIC EXTENT</span>&nbsp;{geoOpacityNumbers(imageDetail, 'geographic', 'extentScore')}</p>
              <br />
              <p><span>OPACITY SEVERITY</span>&nbsp;{geoOpacityNumbers(imageDetail, 'opacity', 'severity')}</p>
              <p><span>OPACITY EXTENT</span>&nbsp;{geoOpacityNumbers(imageDetail, 'opacity', 'extentScore')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DicomViewerBottomBox;
