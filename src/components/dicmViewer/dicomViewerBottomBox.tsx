import React, { useContext, useEffect } from "react";
import { ImageViewerTypes } from "../../context/actions/types";
import { AppContext } from "../../context/context";
import { ISeries } from "../../context/reducers/analyseReducer";
import { isLargestNumber } from "../pastAnalysis/seriesTable";
import PredictionCircle from "../PredictionCircle";
import { formatGender } from "../../shared/utils";
import { useHistory } from 'react-router-dom';
import { Flex, Switch } from '@patternfly/react-core';

const DicomViewerBottomBox = () => {
  const { state: { imgViewer: { isBottomHided, isImgMaskApplied }, prevAnalyses: { selectedImage } }, dispatch } = useContext(AppContext);

  const history = useHistory();

  const toggle = () => {
    dispatch({
      type: ImageViewerTypes.Update_is_bottom_hidded,
      payload: { isBottomHided: !isBottomHided }
    });
  }

  const toggleMask = () => {
    dispatch({
      type: ImageViewerTypes.Update_is_img_mask_applied,
      payload: { isImgMaskApplied: !isImgMaskApplied }
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
  const { dcmImage, series } = selectedImage;

  useEffect(() => {
    if(!series){
      history.push('/');
    }
  }, [history, series]);

  const generateBottomDisplay = (series?: ISeries) => {
    let bottomDisplay: any = [];

    if (!series) {
      return;
    }

    // Dynamically generate the titles to display for the classifications
    series.classifications.forEach((value: number, key: string) => {
      bottomDisplay.push(<p key={key}>{key}: <span className="blueText">{value}</span></p>);
    });

    return bottomDisplay;
  }

  const generateDisplayCircles = (series?: ISeries) => {
    let displayCircles: any = [];

    if (!series) {
      return;
    }

    // Dynamically display the prediction classes/values in the dicomviewerbottombox
    series.classifications.forEach((value: number, key: string) => {
      displayCircles.push(<div className="PredictionArea" key={key}>
        <PredictionCircle
          largeCircle={isLargestNumber(value, series.classifications)}
          predictionNumber={value}
          isNormal={key === "Normal"}
          />
        <div className="topMargin">{key}</div>
      </div>)
    });

    return displayCircles;
  }

  return (
    <div id="ViewerbottomBox"
      className={`flex_col dicomViewerBottomBox ${!isBottomHided ? 'expandedBottom' : 'collapsedBottom'}`}>
      <div className="hideButton">
        <div className='predictionValues moveUp'>

          {generateBottomDisplay(series)}
        
        </div>
        <span className="pointer" onClick={toggle}>{!isBottomHided ? 'hide ' : 'expand '}</span>	&nbsp;
        <span className="pointer" onClick={toggle}>
          {!isBottomHided ? (<i className="fas fa-angle-down"></i>) : (<i className="fas fa-angle-up"></i>)}
        </span>
      </div>
      <div className="flex_row">
        <div className="padding-l-2rem">
          <h2><span><i className="pf-icon pf-icon-info"></i></span></h2>
        </div>
        <div className="flex_row bottomInfoBox">
          <div className="padding-l-2rem">
            <h2>{dcmImage?.PatientName}</h2>
            <p><span>MRN</span> #{dcmImage?.PatientID}</p>
            <p><span>DOB</span> {dcmImage?.PatientBirthDate}</p>
            <p><span>GENDER</span> {dcmImage ? formatGender(dcmImage.PatientSex) : ''}</p>
          </div>
          <div className="padding-l-2rem">
            <h2>{dcmImage?.StudyDescription}</h2>
            <p><span>DATE</span> {dcmImage?.creation_date}</p>
            <p><span>AETITLE</span> Station1234</p>
            <p><span>MODALITY</span> XRAY</p>
          </div>
          <div className="predictions padding-l-2rem">
            <Flex alignItems={{default: "alignItemsFlexEnd"}}>
              <div className="flex_column">
              <Flex justifyContent={{ default: "justifyContentSpaceBetween" }}>
              <span className='logo-text'>COVID-Net</span>
              <Flex>
              <p>Areas of interest Hide | Show </p>
              <Switch id="maskSwitch" isChecked={isImgMaskApplied} onClick={toggleMask} />
              </Flex>
            </Flex>
                <div className="flex_row">
                {generateDisplayCircles(series)}  
                </div>
              </div>        

              <div className="padding-l-2rem">
                <p><span>GEOGRAPHIC SEVERITY</span>&nbsp;{geoOpacityNumbers(series, 'geographic', 'severity')}</p>
                <p><span>GEOGRAPHIC EXTENT</span>&nbsp;{geoOpacityNumbers(series, 'geographic', 'extentScore')}</p>
                <br />
                <p><span>OPACITY SEVERITY</span>&nbsp;{geoOpacityNumbers(series, 'opacity', 'severity')}</p>
                <p><span>OPACITY EXTENT</span>&nbsp;{geoOpacityNumbers(series, 'opacity', 'extentScore')}</p>
              </div>
            </Flex>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DicomViewerBottomBox;
