import React, { useState, useEffect, useContext } from "react";
import DicomViewerService from "../../services/dicomViewerService";
import { AppContext } from '../../context/context'
import { useHistory } from "react-router-dom";
import DicomViewerHeader from "../../components/dicmViewer/dicomViewerHeader";
import DicomViewerBottomBox from "../../components/dicmViewer/dicomViewerBottomBox";
import renderer from "../../services/renderService"
import { windowLevelType } from "../../services/dicomViewerService"
import { ImagesViewerMods } from '../../context/reducers/imgViewerReducer'

const ViewImagePage = () => {
  const { state: { imgViewer: { mod }, prevAnalyses: { selectedImage }, imgViewer: { isImgInverted } } } = useContext(AppContext);
  const history = useHistory();

  useEffect(() => {
    if (!selectedImage.studyInstance) {
      history.push('/')
      return;
    };

    // possible load from location
    // dwv.utils.loadFromUri(window.location.href, app);
    if (selectedImage.studyInstance) {
      DicomViewerService.fetchImageFile(selectedImage.studyInstance.series[selectedImage.index].imageId)
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
            });
            container.addEventListener("mousemove", (event) => {
              if (!mouseDown) {
                return;
              }
              event.preventDefault();

              // it is panning
              console.log(mod !== ImagesViewerMods.WINDOW_LEVEL)
              if (!event.ctrlKey && mod !== ImagesViewerMods.WINDOW_LEVEL) {
                console.log('panning')
                instance.panBy({
                  originX: event.movementX,
                  originY: event.movementY
                });
                return;
              }
              // adjust window/level
              brightness = DicomViewerService.maxMinWindowLevel(brightness + event.movementY, windowLevelType.brightness);
              contrast = DicomViewerService.maxMinWindowLevel(contrast + event.movementX, windowLevelType.contrast);
              const img = document.getElementById('dicomViewerImg')
              if (img) {
                img.style.filter = `brightness(${brightness}%)`;
                img.style.filter = `contrast(${contrast}%)`;
              }
            })
            container.addEventListener('mousedown', e => {
              mouseDown = true;
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
    <div id="dwv" className="imgViewer">
      <DicomViewerHeader></DicomViewerHeader>
      <div className="layerContainer" id="imageContainer">
        <img className={`${isImgInverted ? 'invertImg' : ''}`} id="dicomViewerImg" alt="DICOM Viewer" />
      </div>
      <DicomViewerBottomBox></DicomViewerBottomBox>
    </div>
  )
}

export default ViewImagePage;