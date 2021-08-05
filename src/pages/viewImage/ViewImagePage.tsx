import React, { useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import DicomViewerBottomBox from "../../components/dicmViewer/dicomViewerBottomBox";
import DicomViewerHeader from "../../components/dicmViewer/dicomViewerHeader";
import { AppContext } from '../../context/context';
import DicomViewerService, { windowLevelType } from "../../services/dicomViewerService";
import renderer from "../../services/renderService";

const ViewImagePage = () => {
  const { state: { imgViewer: { mod, isImgInverted, isImgMaskApplied }, prevAnalyses: { selectedImage } } } = useContext(AppContext);
  const history = useHistory();

  const configureImageContainer = () => {
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
  }

  const generateMaskedImageUrl = async (maskImageUrl: string, preprocessedImageUrl: string): Promise<string> => {
    let imageUrl = "";
    if(maskImageUrl && preprocessedImageUrl){
      const mask = new Image();
      mask.src = maskImageUrl;
      const preprocessedImage = new Image();
      preprocessedImage.src = preprocessedImageUrl;
      await Promise.all([mask.decode(), preprocessedImage.decode()]);
      // Using canvas element to layer an image on top of another image
      const canvas = document.createElement("CANVAS") as HTMLCanvasElement;
      const context = canvas.getContext('2d') as CanvasRenderingContext2D;
      canvas.width =  preprocessedImage.width;
      canvas.height = preprocessedImage.height;
      context?.drawImage(preprocessedImage, 0, 0);
      // Darken takes the darkest pixels of the previous layer and subsequent layer
      context.globalCompositeOperation = 'darken';
      context?.drawImage(mask, 0, 0);
      imageUrl = canvas.toDataURL();
    }
    return imageUrl;
  }

  useEffect(() => {
    if (!selectedImage) {
      history.push('/')
      return;
    };

    const imageId = selectedImage?.series?.imageId;
    const maskUrl = selectedImage.gradcamResults?.maskImageUrl;
    const preprocessedImageUrl = selectedImage.gradcamResults?.preprocessedImageUrl;

    const myImage: any = document.querySelector('#dicomViewerImg');
    if(isImgMaskApplied && maskUrl && preprocessedImageUrl){
      generateMaskedImageUrl(maskUrl, preprocessedImageUrl).then((maskedImageUrl: string ) => {
        if(myImage) myImage.src = maskedImageUrl;
        configureImageContainer();
      })
    }else if(imageId){
      DicomViewerService.fetchImageFile(imageId)
        .then((imgBlob: any) => {
          const urlCreator = window.URL || window.webkitURL;
          const objectURL = urlCreator.createObjectURL(imgBlob);
          myImage.src = objectURL;
          configureImageContainer();
        })
    }
  }, [selectedImage, history, mod, isImgMaskApplied])

  return (
    <div id="dicomImgViewer" className="imgViewer">
      <DicomViewerHeader></DicomViewerHeader>
      <div className="layerContainer" id="imageContainer">
        <img className={isImgInverted && !isImgMaskApplied ? "invertImg" : "" } id="dicomViewerImg" alt="DICOM Viewer" />
      </div>
      <DicomViewerBottomBox></DicomViewerBottomBox>
    </div>
  )
}

export default ViewImagePage;
