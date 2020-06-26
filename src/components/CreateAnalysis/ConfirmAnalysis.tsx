import React, { useContext } from "react";
import ImageSelectionBox from "./ImageSelectionBox";
import RightArrowButton from "../../pages/CreateAnalysisPage/RightArrowButton";
import { AppContext } from "../../context/context";
import { DcmImage } from "../../context/reducers/dicomImagesReducer";
import CreateAnalysisService from "../../services/CreateAnalysisService";

interface ConfirmAnalysisProps{
  submit: () => void
}

const ConfirmAnalysis: React.FC<ConfirmAnalysisProps> = ({submit}) => {
  const { state: { dcmImages, createAnalysis: { selectedStudyUIDs } } } = useContext(AppContext);

  return (
    <div className="ConfirmAnalysis">
      {dcmImages.map((img: DcmImage, i) => {
        const isSelected: boolean = CreateAnalysisService.isImgSelected(selectedStudyUIDs, img);
        if (!isSelected) return null;
        return (
          <React.Fragment key={i}>
            <ImageSelectionBox img={img}></ImageSelectionBox>
          </React.Fragment>
        )
      })}
      <RightArrowButton className="rightAlign" click={submit}>Submit</RightArrowButton>
    </div>
  )
}

export default ConfirmAnalysis;