import React, { useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import DicomViewerBottomBox from "../../components/dicmViewer/dicomViewerBottomBox";
import DicomViewerHeader from "../../components/dicmViewer/dicomViewerHeader";
import { ImageViewerTypes } from "../../context/actions/types";
import { AppContext } from '../../context/context';
import DicomViewerService, { windowLevelType } from "../../services/dicomViewerService";
import renderer from "../../services/renderService";

const ViewImagePage = () => {
  const { state: { imgViewer: { mod, isResetButtonPressed, isImgInverted, isImgMaskApplied }, prevAnalyses: { selectedImage } }, dispatch } = useContext(AppContext);
  const history = useHistory();

  const showContrastBrightness = (brightness: number, contrast: number) => {
    const imgBrightnesss = document.getElementById('imgBrightness');
    const imgContrast = document.getElementById('imgContrast')
    if (imgBrightnesss && imgContrast) {
      imgBrightnesss.innerHTML = brightness.toString();
      imgContrast.innerHTML = contrast.toString();
    }
  }

  useEffect(() => {
    if (!selectedImage) {
      history.push('/')
      return;
    };

    const imageId = selectedImage?.series?.imageId;

    if (imageId) {
      DicomViewerService.fetchImageFile(imageId)
        .then((imgBlob: any) => {
          const myImage: any = document.querySelector('#dicomViewerImg');
          const urlCreator = window.URL || window.webkitURL;
          var objectURL = urlCreator.createObjectURL(imgBlob);
          if (myImage) myImage.src = isImgMaskApplied ? selectedImage.gradcamResults?.imageUrl : objectURL;
          const container = document.getElementById("imageContainer");
          const instance = renderer({ minScale: .1, maxScale: 30, element: container?.children[0], scaleSensitivity: 50 });
          if (container) {
            let leftMouseDown = false;
            let middleMouseDown = false;
            let rightMouseDown = false;
            let brightness: number = 100;
            let contrast: number = 100;
            showContrastBrightness(brightness, contrast)
            container.addEventListener("wheel", (event) => {
              const direction = Math.sign(event.deltaY) > 0 ? 1 : -1
              event.preventDefault();
              instance.zoom({
                deltaScale: direction,
                x: event.pageX,
                y: event.pageY
              });
            });
            container.addEventListener("dblclick", () => { // resets 
              instance.panTo({
                originX: 0,
                originY: 0,
                scale: 1,
              });
              brightness = 100;
              contrast = 100
              const img = document.getElementById('dicomViewerImg')
              img?.setAttribute('style', `filter: brightness(${brightness}%) contrast(${contrast}%);`);
              showContrastBrightness(brightness, contrast);
            });
            container.addEventListener("mousemove", (event) => {
              if (!leftMouseDown && !middleMouseDown && !rightMouseDown) {
                return;
              }
              event.preventDefault();
              if (leftMouseDown && event.ctrlKey || rightMouseDown) {
                // adjust window/level
                brightness = DicomViewerService.maxMinWindowLevel(brightness + event.movementY, windowLevelType.brightness);
                contrast = DicomViewerService.maxMinWindowLevel(contrast + event.movementX, windowLevelType.contrast);
                const img = document.getElementById('dicomViewerImg')
                if (img) {
                  img.style.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
                  showContrastBrightness(brightness, contrast);
                }
              } else if (leftMouseDown && event.shiftKey || middleMouseDown){
                const direction = event.movementY > 0 ? 1: -1;
                const rect: DOMRect = myImage.getBoundingClientRect();
                const centerX = rect.x + rect.width / 2;
                const centerY = rect.y + rect.height / 2;
                event.preventDefault();
                instance.zoom({
                  deltaScale: direction,
                  x: centerX,
                  y: centerY
                });
              } else { // panning
                instance.panBy({
                  originX: event.movementX,
                  originY: event.movementY
                });
                return;
              }
            })
            container.addEventListener('mousedown', e => {
              switch(e.button){
                case 0: 
                  leftMouseDown = true;
                  break;
                
                case 1:
                  middleMouseDown = true;
                  break;
                
                case 2:
                  rightMouseDown = true;
                  break;
                
                default:
              } 
            })
            container.addEventListener('mouseup', e => {
              switch(e.button){
                case 0: 
                  leftMouseDown = false;
                  break;
                
                case 1:
                  middleMouseDown = false;
                  break;
                
                case 2:
                  rightMouseDown = false;
                  break;
                
                default:
              }
            })

            const bottomBox = document.getElementById('ViewerbottomBox');
            const upperBox = document.getElementById('ViewerHeaderBox');
            if (bottomBox && upperBox) {
              bottomBox.addEventListener('mousemove', e => {
                leftMouseDown = false;
                middleMouseDown = false;
                rightMouseDown = false;
              });
              upperBox.addEventListener('mousemove', e => {
                leftMouseDown = false;
                middleMouseDown = false;
                rightMouseDown = false;
              });
            }
          }
        })
    }
  }, [selectedImage, history, mod, isImgMaskApplied])

  useEffect(() => {
    const dicomViewerImg = document.getElementById('dicomViewerImg');
    if(dicomViewerImg){
      dicomViewerImg.addEventListener("contextmenu", (e) => e.preventDefault());
    }

  }, []);

  useEffect(() => {
    if(isResetButtonPressed){
      const container = document.getElementById("imageContainer");
      const instance = renderer({ minScale: .1, maxScale: 30, element: container?.children[0], scaleSensitivity: 50 });
      if (container) {
        instance.panTo({
          originX: 0,
          originY: 0,
          scale: 1,
        });
        const brightness = 100;
        const contrast = 100;
        const img = document.getElementById('dicomViewerImg')
        img?.setAttribute('style', `filter: brightness(${brightness}%) contrast(${contrast}%);`);
        showContrastBrightness(brightness, contrast);
      }
      dispatch({
        type: ImageViewerTypes.Update_is_reset_button_pressed,
        payload: { isResetButtonPressed: false }
      })
    }
  }, [isResetButtonPressed]);

  return (
    <div id="dicomImgViewer" className="imgViewer">
      <DicomViewerHeader></DicomViewerHeader>
      <div className="layerContainer" id="imageContainer">
        <img className={`${isImgInverted ? 'invertImg' : ''}`} id="dicomViewerImg" alt="DICOM Viewer" />
      </div>
      <DicomViewerBottomBox></DicomViewerBottomBox>
    </div>
  )
}

export default ViewImagePage;
