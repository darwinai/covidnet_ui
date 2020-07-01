import React, { useContext } from "react";
import { ImageViewerTypes } from "../../context/actions/types";
import { AppContext } from "../../context/context";
import PredictionCircle from '../PredictionCircle';

const DicomViewerBottomBox = () => {
  const { state: { imgViewer: { isBottomHided } }, dispatch } = useContext(AppContext)

  const toggle = () => {
    dispatch({
      type: ImageViewerTypes.Update_is_bottom_hidded,
      payload: { isBottomHided: !isBottomHided }
    })
  }

  return (
    <div className={`flex_col dicomViewerBottomBox ${!isBottomHided ? 'expandedBottom' : 'collapsedBottom'}`}>
      <div className="hideButton">
        <span className="pointer" onClick={toggle}>{!isBottomHided ? 'hide ' : 'expand '}</span>	&nbsp;
        <span className="pointer" onClick={toggle}>{!isBottomHided ? (<i className="fas fa-angle-down"></i>) : (<i className="fas fa-angle-up"></i>)}</span>
      </div>
      <div className="flex_row bottomInfoBox">
        <div className="padding-l-2rem">
          <h2><span><i className="pf-icon pf-icon-info"></i></span></h2>
        </div>
        <div className="padding-l-2rem">
          <h2>Patient D.Patient</h2>
          <p><span>MRN</span> #12313123131</p>
          <p><span>DOB</span> 2018 01 05 2y 6m</p>
          <p><span>GENDER</span> Female</p>
        </div>
        <div className="padding-l-2rem">
          <h2>PatientStudy C</h2>
          <p><span>DATE</span> 11 30 2019</p>
          <p><span>AETITLE</span> Station1234</p>
          <p><span>MODALITY</span> XRAY</p>
        </div>
        <div className="predictions padding-l-2rem">
          <span className='logo-text'>COVID-Net</span>
          <div className="flex_row">
            <div className="PredictionArea">
              <PredictionCircle largeCircle={true} predictionNumber={80} />
              <div className="topMargin">COVID-19</div>
            </div>
            <div className="PredictionArea padding-l-2rem">
              <PredictionCircle largeCircle={false} predictionNumber={10} />
              <div className="topMargin">PNEUMONIA</div>
            </div>
            <div className="PredictionArea padding-l-2rem">
              <PredictionCircle largeCircle={false} predictionNumber={10} />
              <div className="topMargin">NORMAL</div>
            </div>
            <div className="padding-l-2rem">
              <p><span>GEOGRAPHIC SEVERITY</span> 60%</p>
              <p><span>GEOGRAPHIC EXTENT</span> 1.1</p>
              <br />
              <p><span>OPACITY SEVERITY</span> 50%</p>
              <p><span>OPACITY EXTENT</span> 0.3</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DicomViewerBottomBox;