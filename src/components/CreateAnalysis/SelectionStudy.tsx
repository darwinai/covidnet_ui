import { Badge } from '@patternfly/react-core';
import React, { useContext, useEffect } from "react";
import { CreateAnalysisTypes } from "../../context/actions/types";
import { AppContext } from "../../context/context";
import { StudyInstance } from "../../services/CreateAnalysisService";

const SelectionStudy: React.FC<StudyInstance> = ({
  studyInstanceUID,
  studyDescription,
  modality,
  studyDate,
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
      className={`SelectionStudy ${isSelected ? 'selected' : 'notSelected'}`}
      onClick={selectThisStudy}
    >
      <h1 id="studyDescription" className={`${currSelectedStudyUID === studyInstanceUID ? 'blueText' : ''}`}>
        {studyDescription}&nbsp;<span id="blueBadge">{isSelected ?
          (<Badge>{Object.keys(imagesSelectedDict).length}</Badge>) : null}</span>
          </h1>
      <p className="greyText"><span className="outtline-box">{modality}</span> {studyDate}</p>
    </div>
  )
}

export default SelectionStudy;