import React, { useContext, useState } from "react";
import ImageSelectionBox from "./ImageSelectionBox";
import RightArrowButton from "../../pages/CreateAnalysisPage/RightArrowButton";

const ConfirmAnalysis = () => {

  const clickPlaceHolder = () => {}
  return (
    <div className="ConfirmAnalysis">
      <ImageSelectionBox></ImageSelectionBox>
      <RightArrowButton className="rightAlign" click={clickPlaceHolder}>Submit</RightArrowButton>
    </div>
  )
}

export default ConfirmAnalysis;