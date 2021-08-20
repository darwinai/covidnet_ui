import React, { useContext } from "react";
import { AppContext } from "../../context/context";
import { DcmImage } from "../../context/reducers/dicomImagesReducer";
import RightArrowButton from "../../pages/GeneratePredictionPage/RightArrowButton";
import GeneratePredictionService from "../../services/GeneratePredictionService";
import ImageSelectionBox from "./ImageSelectionBox";

interface ConfirmAnalysisProps{
  submit: () => void
}

const ConfirmAnalysis: React.FC<ConfirmAnalysisProps> = ({submit}) => {
  const { state: { dcmImages, generatePrediction: { selectedStudyUIDs } } } = useContext(AppContext);

  return (
    <div className="ConfirmAnalysis">
      {dcmImages.allDcmImages.map((img: DcmImage, i: number) => {
        const isSelected: boolean = GeneratePredictionService.isImgSelected(selectedStudyUIDs, img);
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
