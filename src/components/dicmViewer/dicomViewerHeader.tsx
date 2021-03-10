import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import BrightnessMediumIcon from '@material-ui/icons/BrightnessMedium';
import GetAppIcon from '@material-ui/icons/GetApp';
import InvertColorsIcon from '@material-ui/icons/InvertColors';
import PanToolOutlinedIcon from '@material-ui/icons/PanToolOutlined';
import { Spinner, Tooltip, TooltipPosition } from '@patternfly/react-core';
import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import { ImageViewerTypes } from "../../context/actions/types";
import { AppContext } from "../../context/context";
import { ImagesViewerMods } from '../../context/reducers/imgViewerReducer';
import ChrisIntegration from '../../services/chris_integration';

const DicomViewerHeader = () => {
  const [loading, setLoading] = useState(false);
  const [isFullScreen, setFullScreen] = useState(false);
  const { state: { imgViewer: { isImgInverted }, prevAnalyses: { selectedImage } }, dispatch } = useContext(AppContext);
  const history = useHistory()

  const switchMode = (mod: ImagesViewerMods) => {
    // dispatch({
    //   type: ImageViewerTypes.Update_view_mod,
    //   payload: { mod }
    // })
  }

  const switchFullScreen = () => {
    const elem: any = document.getElementById('dicomImgViewer')
    if (!isFullScreen) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
        elem?.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
      }
    } else {
      document.exitFullscreen();
    }
    setFullScreen(!isFullScreen);
  }

  const printPDF = () => {
    setLoading(true)
    ChrisIntegration.pdfGeneration(selectedImage)
      .then(() => setLoading(false))
  }

  return (
    <div id="ViewerHeaderBox" className="flex_row dicomViewerHeader">
      <div className="headerlogo padding_left_right_2rem">
        <span className='logo-text'>COVID-Net</span>
        <a onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {history.push('/'); e.preventDefault();}} href="/#"> <i className="fas fa-angle-left"></i> Back to Dashboard</a>
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
        <Tooltip
          position={TooltipPosition.bottom}
          isContentLeftAligned
          content={<div>LMB + Drag</div>
          }
        >
          <button
            onClick={() => { switchMode(ImagesViewerMods.ZOOM) }}><i className="fas fa-search-plus"></i></button>
        </Tooltip>
        <Tooltip
          position={TooltipPosition.bottom}
          isContentLeftAligned
          content={<div>Scroll<br />Alternatively:<br /> Shift+LMB+Drag Up to zoom out and drag down to zoom in</div>}
        >
          <button
            onClick={() => switchMode(ImagesViewerMods.PAN)}><PanToolOutlinedIcon></PanToolOutlinedIcon></button>
        </Tooltip>
        <Tooltip
          position={TooltipPosition.bottom}
          isContentLeftAligned
          content={<div> Window/Level: Ctrl+LMB+Drag <br></br>
            &nbsp;&nbsp;&nbsp;&nbsp;Horizontal movement adjusts contrast <br></br>
            &nbsp;&nbsp;&nbsp;&nbsp;Vertical movement adjusts brightness</div>}
        >
          <button
            onClick={() => switchMode(ImagesViewerMods.WINDOW_LEVEL)}><BrightnessMediumIcon /></button>
        </Tooltip>
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
                Zoom: Scroll or Shift+LMB+Drag Up to zoom out,drag down to zoom in<br></br>
                Window/Level: Ctrl+LMB+Drag <br></br>
                &nbsp;&nbsp;&nbsp;&nbsp;Horizontal movement adjusts contrast <br></br>
                &nbsp;&nbsp;&nbsp;&nbsp;Vertical movement adjusts brightness
              </div>
            }
          >
            <i className="pf-icon pf-icon-info"></i>
          </Tooltip>
        </button>
        <button onClick={printPDF}>{!loading ? <GetAppIcon /> : <Spinner size="lg"/>}</button>
        <div className='padding_left_right_2rem'></div>
        <button onClick={() => switchFullScreen()}>
          {
            isFullScreen ? <i className="fas fa-compress"></i> : <AspectRatioIcon></AspectRatioIcon>
          }
        </button>
        <div className="predictionValues moveDown rightMargin">
          <p>Brightness <span id="imgBrightness"></span></p>
          <p>Contrast <span id="imgContrast"></span></p>
        </div>
      </div >
    </div >
  )
}

export default DicomViewerHeader;