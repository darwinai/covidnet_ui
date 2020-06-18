import React, { useContext } from "react";
import { Badge } from '@patternfly/react-core';
import { StudyInstance } from "../../services/CreateAnalysisService";
import { AppContext } from "../../context/context";


const SelectionStudy: React.FC<StudyInstance> = ({
  studyInstanceUID,
  studyDescription,
  modality,
  createdDate,
}) => {
  const { state } = useContext(AppContext);
  const { createAnalysis } = state;
  const { selectedStudyUIDs, currSelectedStudyUID } = createAnalysis;
  const imagesSelectedDict = selectedStudyUIDs[studyInstanceUID]

  let isSelected = false
  return (
    <div className={`SelectionStudy ${isSelected ? 'selected' : ''}`}>
      <h1 className={`${currSelectedStudyUID === studyInstanceUID ? 'blueText': ''}`}>
        {!!imagesSelectedDict && Object.keys(imagesSelectedDict).length > 0 ? 
          (<Badge>{Object.keys(imagesSelectedDict).length}</Badge>) : null}
        &nbsp;{studyDescription}</h1>
      <p className="greyText"><span className="outtline-box">{modality}</span> {createdDate} </p>
    </div>
  )
}

export default SelectionStudy;