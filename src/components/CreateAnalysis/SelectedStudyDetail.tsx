import { Alert, Checkbox } from '@patternfly/react-core';
import React, { useContext } from "react";
import { CreateAnalysisTypes } from "../../context/actions/types";
import { AppContext } from "../../context/context";
import { DcmImage } from "../../context/reducers/dicomImagesReducer";
import CreateAnalysisService from "../../services/CreateAnalysisService";
import { calculatePatientAge } from "../../shared/utils";

const SelectedStudyDetail = () => {
  const { state: { createAnalysis: { currSelectedStudyUID, selectedStudyUIDs }, dcmImages }, dispatch } = useContext(AppContext);

  const images: DcmImage[] = CreateAnalysisService.returnAllImagesInOneStudy(dcmImages?.filteredDcmImages, currSelectedStudyUID);

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
    });
  }

  if (images.length > 0) {
    const { StudyDescription, PatientBirthDate, Modality, StudyDate } = images[0];
    return (
      <div className="detail-select">
        <div className="flex_row">
          <div className="half_width padding_2rem">
            <h1 className="study-title"> {StudyDescription} <span className="outtline-box red-small">{Modality}</span></h1>
            <div className="padding_bot_1rem"></div>
            <div className="flex_row">
              <div className="half_width">
                <h2 className="bold med-size">Patient Age</h2>
                <p className="color_grey">{calculatePatientAge(PatientBirthDate)}y</p>
              </div>
              <div className="half_width">
                <h2 className="bold med-size">Performed Station</h2>
                <p className="color_grey">Station1234</p>
              </div>
              <div className="half_width">
                <h2 className="bold med-size">Study Date</h2>
                <p className="color_grey">{StudyDate}</p>
              </div>
            </div>
          </div>
          <div className="half_width padding_2rem s-large">
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
          <div className="pf-l-grid pf-m-all-6-col">
            {images.map((img: DcmImage, i) => {
              const isSelected: boolean = CreateAnalysisService.isImgSelected(selectedStudyUIDs, img);
              return (
                <div className="pf-l-grid__item margin-top-bottom" key={i}>
                                    <Checkbox 
                  className={`container checkmark ${isSelected? 'selectedCheckbox' : null}`}
                  label={img.SeriesDescription}
                  aria-label={img.SeriesDescription}
                  id={"check-"+i} 
                  isChecked={isSelected} 
                  onChange={() => addImgToAnalysis(isSelected, img)} 
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default SelectedStudyDetail;
