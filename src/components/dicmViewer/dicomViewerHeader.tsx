import BrightnessMediumIcon from '@material-ui/icons/BrightnessMedium';
import InvertColorsIcon from '@material-ui/icons/InvertColors';
import PanToolOutlinedIcon from '@material-ui/icons/PanToolOutlined';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import { ImageViewerTypes } from "../../context/actions/types";
import { AppContext } from "../../context/context";
import { ImagesViewerMods } from '../../context/reducers/imgViewerReducer';

const DicomViewerHeader = () => {
  const { state: { imgViewer: { isImgInverted } }, dispatch } = useContext(AppContext);
  const history = useHistory()

  const switchMode = (mod: ImagesViewerMods) => {
    // dispatch({
    //   type: ImageViewerTypes.Update_view_mod,
    //   payload: { mod }
    // })
  }

  return (
    <div id="ViewerHeaderBox" className="flex_row dicomViewerHeader">
      <div className="headerlogo padding_left_right_2rem">
        <span className='logo-text'>COVID-Net</span>
        <a onClick={() => history.push('/')}> <i className="fas fa-angle-left"></i> Back to Dashboard</a>
      </div>
      <div className='padding_left_right_2rem'>
        {/* Tools
        <button
          className={`${mod === ImagesViewerMods.ZOOM ? 'highlightedMod' : ''}`}
          onClick={() => switchMode(ImagesViewerMods.ZOOM)}><i className="fas fa-search-plus"></i></button>
        <button
          className={`${mod === ImagesViewerMods.PAN ? 'highlightedMod' : ''}`}
          onClick={() => switchMode(ImagesViewerMods.PAN)}><PanToolOutlinedIcon></PanToolOutlinedIcon></button>
        <button
          className={`${mod === ImagesViewerMods.WINDOW_LEVEL ? 'highlightedMod' : ''}`}
          onClick={() => switchMode(ImagesViewerMods.WINDOW_LEVEL)}><BrightnessMediumIcon/></button> */}
        Tools
        <button
          onClick={() => { switchMode(ImagesViewerMods.ZOOM) }}><i className="fas fa-search-plus"></i></button>
        <button
          onClick={() => switchMode(ImagesViewerMods.PAN)}><PanToolOutlinedIcon></PanToolOutlinedIcon></button>
        <button
          onClick={() => switchMode(ImagesViewerMods.WINDOW_LEVEL)}><BrightnessMediumIcon /></button>
      </div>
      <div className='padding_left_right_2rem flex_row'>
        <button onClick={() => dispatch({
          type: ImageViewerTypes.Update_is_img_inverted,
          payload: { isImgInverted: !isImgInverted }
        })}>
          <Tooltip
            position={TooltipPosition.bottom}
            content={
              <div>Invert</div>
            }
          >
            <InvertColorsIcon />
          </Tooltip>
        </button>
        <button>
          <Tooltip
            position={TooltipPosition.bottom}
            isContentLeftAligned
            content={
              <div>
                Pan: LMB + Drag <br></br>
                Zoom: Scroll <br></br>
                Window/Level: ctrl+LMB+Drag <br></br>
                &nbsp;&nbsp;&nbsp;&nbsp;Horizontal movement adjusts contrast <br></br>
                &nbsp;&nbsp;&nbsp;&nbsp;Vertical movement adjusts brightness
              </div>
            }
          >
            <i className="pf-icon pf-icon-info"></i>
          </Tooltip>
        </button>
        <div className='padding_left_right_2rem'></div>
        <button><i className="fas fa-compress"></i></button>
        <div className="predictionValues moveDown rightMargin">
          <p>Brightness <span id="imgBrightness"></span></p>
          <p>Contrast <span id="imgContrast"></span></p>
        </div>
      </div >
    </div >
  )
}

export default DicomViewerHeader;