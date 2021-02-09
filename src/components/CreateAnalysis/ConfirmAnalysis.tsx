import React, { useContext } from "react";
import { AppContext } from "../../context/context";
import { DcmImage } from "../../context/reducers/dicomImagesReducer";
import RightArrowButton from "../../pages/CreateAnalysisPage/RightArrowButton";
import CreateAnalysisService from "../../services/CreateAnalysisService";
import ImageSelectionBox from "./ImageSelectionBox";

interface ConfirmAnalysisProps{
  submit: (XrayModel?: string, CTModel?: string) => (() => void)
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