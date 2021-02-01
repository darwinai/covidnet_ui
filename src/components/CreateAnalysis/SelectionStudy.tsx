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
  setModelType,
  index
}) => {
  const { state: { createAnalysis: { selectedStudyUIDs, currSelectedStudyUID } }, dispatch } = useContext(AppContext);
  const imagesSelectedDict = selectedStudyUIDs[studyInstanceUID]

  const selectThisStudy = (index: number) => {
    dispatch({
      type: CreateAnalysisTypes.UpdateCurrSelectedStudyUID,
      payload: {
        studyUID: studyInstanceUID
      }
    });
    if (setModelType) {
      setModelType(index);
    }
  }

  const isSelected: boolean = !!imagesSelectedDict && Object.keys(imagesSelectedDict).length > 0;
  return (
    <div
      className={`SelectionStudy ${isSelected ? 'selected' : ''}`}
      onClick={() => {if (index !== undefined) selectThisStudy(index)}}
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