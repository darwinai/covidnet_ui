import { DrawerCloseButton } from "@patternfly/react-core";
import React, { useContext } from "react";
import image_placeholder from "../../assets/images/image_placeholder.png";
import { GeneratePredictionTypes } from "../../context/actions/types";
import { AppContext } from "../../context/context";
import { DcmImage } from "../../context/reducers/dicomImagesReducer";
import { formatDate } from "../../shared/utils";

type ImageSelectionBoxProps = {
  img: DcmImage
}

const ImageSelectionBox: React.FC<ImageSelectionBoxProps> = ({ img }) => {
  const { StudyDescription, SeriesDescription, fname, creation_date } = img
  const { dispatch } = useContext(AppContext);

  const removeImg = (img: DcmImage) => dispatch({
    type: GeneratePredictionTypes.Remove_selected_studies_UID,
    payload: {
      studyUID: img.StudyInstanceUID,
      SeriesInstanceUID: img.SeriesInstanceUID,
      fname: img.fname
    }
  })


  return (
    <div className="flex_row">
      <DrawerCloseButton onClick={() => removeImg(img)} ></DrawerCloseButton>
      <div>
        <p className="lg_p">{SeriesDescription}</p>
        <div className="flex_row margin_top">
          <div className="margin_left">
            <p className="color_grey">{StudyDescription}</p>
            <p className="color_grey">{"Filename: " + fname.split('/')[3]}</p>
            <p className="color_grey">{"Date: " + formatDate(creation_date)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageSelectionBox;
