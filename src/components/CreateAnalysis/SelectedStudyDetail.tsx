import { Alert } from '@patternfly/react-core';
import React, { useContext } from "react";
import { CreateAnalysisTypes } from "../../context/actions/types";
import { AppContext } from "../../context/context";
import { DcmImage } from "../../context/reducers/dicomImagesReducer";
import CreateAnalysisService from "../../services/CreateAnalysisService";

const SelectedStudyDetail = () => {
  const { state: { createAnalysis: { currSelectedStudyUID, selectedStudyUIDs }, dcmImages }, dispatch } = useContext(AppContext);
  const images: DcmImage[] = CreateAnalysisService.returnAllImagesInOneStudy(dcmImages?.filteredDcmImages, currSelectedStudyUID);

  console.log(images);
  let content = null;

  const addImgToAnalysis = (isSelected: boolean, img: DcmImage): void => {
    let actionType = CreateAnalysisTypes.Add_selected_studies_UID;
    if (isSelected) actionType = CreateAnalysisTypes.Remove_selected_studies_UID;
    dispatch({
      type: actionType,
      payload: {
        studyUID: img.StudyInstanceUID,
        SeriesInstanceUID: img.SeriesInstanceUID,
        fname: img.fname
      }
    })
  }

  if (images.length > 0) {
    const { StudyDescription, StudyInstanceUID, PatientAge, Modality } = images[0];
    content = (
      <div className="detail-select">
        <div className="flex_row">
          <div className="half_width padding_2rem">
            <h1 className="study-title"> {StudyDescription} <span className="outtline-box red-small">{Modality}</span></h1>
            <p className="color_grey s-large">Study Instance UID#{StudyInstanceUID}</p>
            <div className="padding_bot_1rem"></div>
            <div className="flex_row">
              <div className="half_width">
                <h2 className="bold med-size">Patient Age</h2>
                <p className="color_grey">{PatientAge}y</p>
              </div>
              <div className="half_width">
                <h2 className="bold med-size">Performed Station</h2>
                <p className="color_grey">Station1234</p>
              </div>
            </div>
          </div>
          <div className="half_width padding_2rem s-large">
            Chest  Scans of suspected patient.
      </div>
        </div>
        <div className="padding_left_right_2rem">
          <Alert isInline variant="warning" title="Select frontal chest images only">
            <p>Non-frontal chest images will result in invalid predictive analysis results</p>
          </Alert>
        </div>
        <div className="padding_2rem">
          <div className="border-bottom-grey">
            <h1 className="study-title">Series</h1>
          </div>
          <div className="flex_row_wrap">
            {images.map((img: DcmImage, i) => {
              const isSelected: boolean = CreateAnalysisService.isImgSelected(selectedStudyUIDs, img);
              return (
                <div className="half_width margin-top-bottom" key={i}>
                  <label className={`container ${isSelected ? 'blueText' : null}`}>{img.fname.split('/')[3]}
                    <input type="checkbox" checked={isSelected} onChange={() => addImgToAnalysis(isSelected, img)} />
                    <span className="checkmark"></span>
                  </label>
                </div>
              )})}
          </div>
        </div>
      </div>
    )
  }

  return content;
}

export default SelectedStudyDetail;
