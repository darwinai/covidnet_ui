import React, { useContext } from "react";
import { DrawerCloseButton } from "@patternfly/react-core";
import image_placeholder from "../../assets/images/image_placeholder.png"
import { DcmImage } from "../../context/reducers/dicomImagesReducer";
import CreateAnalysisService from "../../services/CreateAnalysisService";
import { AppContext } from "../../context/context";
import { CreateAnalysisTypes } from "../../context/actions/types";

type ImageSelectionBoxProps = {
  img: DcmImage
}

const ImageSelectionBox: React.FC<ImageSelectionBoxProps> = ({ img }) => {
  const { StudyDescription, SeriesDescription, fname, creation_date } = img
  const { dispatch } = useContext(AppContext);

  const removeImg = (img: DcmImage) => dispatch({
    type: CreateAnalysisTypes.Remove_selected_studies_UID,
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
          <img src={image_placeholder} alt="selected" width={60} height={60} />
          <div className="margin_left">
            <p className="color_grey">{StudyDescription}</p>
            <p className="color_grey">Filename{fname.split('/')[3]}</p>
            <p className="color_grey">{CreateAnalysisService.formatDate(creation_date)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageSelectionBox;
