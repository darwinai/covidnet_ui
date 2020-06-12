import React, { useContext, useState, Dispatch, SetStateAction } from "react";
import avator from '../../assets/images/avator.png';
import {
  Button, Badge
} from '@patternfly/react-core';
import { ArrowRightIcon } from '@patternfly/react-icons';
import SelectionStudy from "./SelectionStudy";

interface CreateAnalysisDetailProps {
  setIsExpanded: Dispatch<SetStateAction<boolean>>
}

const CreateAnalysisDetail: React.FC<CreateAnalysisDetailProps> = (props) => {

  return (
    <React.Fragment>
      <div className="detail-wrapper">
        <div className="detail-top-wrapper">
          <div className="detail-top-left">
            <h1>Create a new predictive analysis</h1>
            <p>Select at least one image series below and select the "Analyze" button to receive COVID, pneumonia
            and normal predictions per image.
                  </p>
            <div className="detail-patient">
              <div>
                <img src={avator} alt="avator" width="100px" height="100px"></img>
              </div>
              <div className="detail-patient-title">
                <h2>Patience D. Patient</h2>
                <p>MRN#3211232142112312</p>
              </div>
              <div className="detail-patient-name-age">
                <div className="detail-patient-name-age-title">
                  <h3>Patient Age</h3>
                  <h3>Patient Birthdate</h3>
                  <h3>Patient Gender</h3>
                </div>
                <div className="detail-patient-name-age-info">
                  <p>2y 6m</p>
                  <p>2018 01 05</p>
                  <p>Female</p>
                </div>
              </div>
            </div>
          </div>
          <div className="detail-top-right">
            <div className="detail-top-right-box">
              <div className="numberCircle">2</div>
              <h3>Series selected</h3>
              <a>(More details)</a>
              <Button variant="primary" onClick={() => props.setIsExpanded(true)}>
                Analyze <ArrowRightIcon></ArrowRightIcon>
              </Button>
            </div>
          </div>
        </div>
        <div className="detail-bottom-wrapper">
          <div className="detail-select-studies">
            <SelectionStudy></SelectionStudy>
          </div>
          <div className="detail-select">

          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default CreateAnalysisDetail;


/*
swift -A http://127.0.0.1:8080/auth/v1.0 -U chris:chris1234 -K testing upload users
/Users/jbernal/PACS/BCH/5296709-VITO.DANIEL/CT.Abdomen.thru.Symphysis.w..Contrast-20120602-1.2.840.113619.2.55.3.51037702.990.1338550396.599/COR.STD-20120602-1.2.840.113619.2.80.45556984.23031.1338680717.1.4.1/00020-1.2.840.113619.2.80.45556984.23031.1338680724.22.dcm --object-name "SERVICES/PACS/BCH/5296709-VITO.DANIEL/CT.Abdomen.thru.Symphysis.w..Contrast-20120602-1.2.840.113619.2.55.3.51037702.990.1338550396.599/COR.STD-20120602-1.2.840.113619.2.80.45556984.23031.1338680717.1.4.1/00020-1.2.840.113619.2.80.45556984.23031.1338680724.22.dcm"
*/