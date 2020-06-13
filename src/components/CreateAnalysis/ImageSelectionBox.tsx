import React from "react";
import { DrawerCloseButton } from "@patternfly/react-core";
import image_placeholder from "../../assets/images/image_placeholder.png"

const ImageSelectionBox = () => {
  return (
    <div className="flex_row">
      <DrawerCloseButton></DrawerCloseButton>
      <div>
        <p className="lg_p">COR_Chest</p>
        <div className="flex_row margin_top">
          <img src={image_placeholder} alt="selected" width={60} height={60} />
          <div className="margin_left">
            <p className="color_grey">Patient Study A</p>
            <p className="color_grey">Filename213921839.dcm</p>
            <p className="color_grey">2019 11 30</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageSelectionBox;
