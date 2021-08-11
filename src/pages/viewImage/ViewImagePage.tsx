import React, { useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import DicomViewerBottomBox from "../../components/dicmViewer/dicomViewerBottomBox";
import DicomViewerHeader from "../../components/dicmViewer/dicomViewerHeader";
import { AppContext } from '../../context/context';
import DicomViewerService, { windowLevelType } from "../../services/dicomViewerService";
import renderer from "../../services/renderService";

const ViewImagePage = () => {
  const { state: { imgViewer: { mod }, prevAnalyses: { selectedImage }, imgViewer: { isImgInverted } } } = useContext(AppContext);
  const history = useHistory();

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
          if (myImage) myImage.src = objectURL;
          const container = document.getElementById("imageContainer");
          const instance = renderer({ minScale: .1, maxScale: 30, element: container?.children[0], scaleSensitivity: 50 });
          if (container) {
            let mouseDown = false;
            let brightness: number = 100;
            let contrast: number = 100;
            const showContrastBrightness = (brightness: number, contrast: number) => {
              const imgBrightnesss = document.getElementById('imgBrightness');
              const imgContrast = document.getElementById('imgContrast')
              if (imgBrightnesss && imgContrast) {
                imgBrightnesss.innerHTML = brightness.toString();
                imgContrast.innerHTML = contrast.toString();
              }
            }
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
              if (!mouseDown) {
                return;
              }
              event.preventDefault();
              if (event.ctrlKey) {
                // adjust window/level
                brightness = DicomViewerService.maxMinWindowLevel(brightness + event.movementY, windowLevelType.brightness);
                contrast = DicomViewerService.maxMinWindowLevel(contrast + event.movementX, windowLevelType.contrast);
                const img = document.getElementById('dicomViewerImg')
                if (img) {
                  img.style.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
                  showContrastBrightness(brightness, contrast);
                }
              } else if (event.shiftKey){
                const direction = event.movementY > 0 ? 1: -1;
                event.preventDefault();
                instance.zoom({
                  deltaScale: direction,
                  x: event.pageX,
                  y: event.pageY
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
              if (e.button === 0) mouseDown = true;
            })
            container.addEventListener('mouseup', e => {
              mouseDown = false;
            })

            const bottomBox = document.getElementById('ViewerbottomBox');
            const upperBox = document.getElementById('ViewerHeaderBox');
            if (bottomBox && upperBox) {
              bottomBox.addEventListener('mousemove', e => mouseDown = false);
              upperBox.addEventListener('mousemove', e => mouseDown = false);
            }
          }
        })
    }
  }, [selectedImage, history, mod])

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
