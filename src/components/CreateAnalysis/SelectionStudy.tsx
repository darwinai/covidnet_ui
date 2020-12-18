import { Badge } from '@patternfly/react-core';
import React, { useContext } from "react";
import { CreateAnalysisTypes } from "../../context/actions/types";
import { AppContext } from "../../context/context";
import { StudyInstance } from "../../services/CreateAnalysisService";

const SelectionStudy: React.FC<StudyInstance> = ({
  studyInstanceUID,
  studyDescription,
  modality,
  createdDate,
}) => {
  const { state: { createAnalysis: { selectedStudyUIDs, currSelectedStudyUID } }, dispatch } = useContext(AppContext);
  const imagesSelectedDict = selectedStudyUIDs[studyInstanceUID]

  const selectThisStudy = () => {
    dispatch({
      type: CreateAnalysisTypes.UpdateCurrSelectedStudyUID,
      payload: {
        studyUID: studyInstanceUID
      }
    })
  }

  const isSelected: boolean = !!imagesSelectedDict && Object.keys(imagesSelectedDict).length > 0;
  return (
    <div
      className={`SelectionStudy ${isSelected ? 'selected' : ''}`}
      onClick={selectThisStudy}
    >
      <h1 className={`${currSelectedStudyUID === studyInstanceUID ? 'blueText' : ''}`}>
        {isSelected ?
          (<Badge>{Object.keys(imagesSelectedDict).length}</Badge>) : null}
        &nbsp;{studyDescription}</h1>
      <p className="greyText"><span className="outtline-box">{modality}</span> {createdDate} </p>
    </div>
  )
}

export default SelectionStudy;