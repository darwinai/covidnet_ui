import { Badge } from "@patternfly/react-core";
import React, { useContext, useEffect } from "react";
import { CreateAnalysisTypes } from "../../context/actions/types";
import { AppContext } from "../../context/context";
import { StudyInstance } from "../../services/CreateAnalysisService";

const SelectionStudy: React.FC<StudyInstance> = ({
  studyInstanceUID,
  studyDescription,
  modality,
  createdDate,
  setModelType
}) => {
  const { state: { createAnalysis: { selectedStudyUIDs, currSelectedStudyUID } }, dispatch } = useContext(AppContext);
  const imagesSelectedDict = selectedStudyUIDs[studyInstanceUID]

  useEffect(() => {
    if (currSelectedStudyUID === studyInstanceUID) { // Setting the drop-down display options, according to the study's modality (Xray/CT)
      if (setModelType) {
        setModelType(modality);
      }
    }
  }, [currSelectedStudyUID, studyInstanceUID, modality, setModelType]);

  const selectThisStudy = () => {
    dispatch({
      type: CreateAnalysisTypes.UpdateCurrSelectedStudyUID,
      payload: {
        studyUID: studyInstanceUID
      }
    });
  }

  const isSelected: boolean = !!imagesSelectedDict && Object.keys(imagesSelectedDict).length > 0;
  
  return (
    <div
      className={`SelectionStudy ${isSelected ? "selected" : ""}`}
      onClick={selectThisStudy}
    >
      <h1 className={`${currSelectedStudyUID === studyInstanceUID ? "blueText" : ""}`}>
        {isSelected ?
          (<Badge>{Object.keys(imagesSelectedDict).length}</Badge>) : null}
        &nbsp;{studyDescription}</h1>
      <p className="greyText"><span className="outtline-box">{modality}</span> {createdDate} </p>
    </div>
  )
}

export default SelectionStudy;
