import React, { useContext } from "react";
import ImageSelectionBox from "./ImageSelectionBox";
import RightArrowButton from "../../pages/CreateAnalysisPage/RightArrowButton";
import { AppContext } from "../../context/context";
import { DcmImage } from "../../context/reducers/dicomImagesReducer";
import CreateAnalysisService from "../../services/CreateAnalysisService";

const ConfirmAnalysis = () => {
  const { state: { dcmImages, createAnalysis: { selectedStudyUIDs } } } = useContext(AppContext);


  return (
    <div className="ConfirmAnalysis">
      {dcmImages.map((img: DcmImage, i) => {
        const isSelected: boolean = CreateAnalysisService.isImgSelected(selectedStudyUIDs, img);
        if (!isSelected) return null;
        return (
          <React.Fragment key={i}>
            <ImageSelectionBox img={img}></ImageSelectionBox>
            <RightArrowButton className="rightAlign" click={() => {}}>Submit</RightArrowButton>
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default ConfirmAnalysis;