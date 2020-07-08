import React, { useState, useEffect, useContext } from "react";
import DicomViewerService from "../../services/dicomViewerService";
import { AppContext } from '../../context/context'
import { useHistory } from "react-router-dom";
import DicomViewerHeader from "../../components/dicmViewer/dicomViewerHeader";
import DicomViewerBottomBox from "../../components/dicmViewer/dicomViewerBottomBox";
import dwv from 'dwv';

// get element
dwv.gui.getElement = dwv.gui.base.getElement;

// Image decoders (for web workers)
dwv.image.decoderScripts = {
  "jpeg2000": "assets/dwv/decoders/pdfjs/decode-jpeg2000.js",
  "jpeg-lossless": "assets/dwv/decoders/rii-mango/decode-jpegloss.js",
  "jpeg-baseline": "assets/dwv/decoders/pdfjs/decode-jpegbaseline.js",
  "rle": "assets/dwv/decoders/dwv/decode-rle.js"
};

const ViewImagePage = () => {
  const { state: { prevAnalyses: { selectedImage }, imgViewer: { isImgInverted } } } = useContext(AppContext);
  const [dwvApp, setDwvApp] = useState({
    fakeInitialMock: true,
    loadFiles: (e: any) => { }
  });
  const [loadProgress, setLoadProgress] = useState(0)
  const history = useHistory();


  const onDrop = (event: DragEvent) => {
    console.log('in on drop')
    // prevent default handling
    event.stopPropagation();
    event.preventDefault();
    // load files
    console.log(dwvApp)
    if (dwvApp && !dwvApp.fakeInitialMock && event.dataTransfer) {
      dwvApp.loadFiles(event.dataTransfer.files);
    }
  }

  useEffect(() => {
    if (!selectedImage.studyInstance) {
      history.push('/')
      return;
    };
    const app = new dwv.App();

    app.init({
      "containerDivId": "dwv",
      "tools": null
    });

    // load events
    let nReceivedError = 0;
    let nReceivedAbort = 0;
    app.addEventListener('load-start', (/*event*/) => {
      nReceivedError = 0;
      nReceivedAbort = 0;
    });
    app.addEventListener("load-progress", (event: any) => {
      console.log('in Load progress')
      setLoadProgress(event.loaded)
    });
    app.addEventListener("load", (/*event*/) => {
      console.log('got to load')
      console.log(app.getMetaData())
    });
    app.addEventListener('load-end', (/*event*/) => {
      console.log('got to load-end')
      if (nReceivedError) {
        setLoadProgress(0)
        alert('Received errors during load. Check log for details.');
      }
      if (nReceivedAbort) {
        setLoadProgress(0);
        alert('Load was aborted')
      }
    });
    app.addEventListener('error', (event: any) => {
      console.log('in listerner error');
      console.error(event.error);
      ++nReceivedError;
    });
    app.addEventListener('abort', (/*event*/) => {
      console.log('in listerner abort');
      ++nReceivedAbort;
    });

    // handle key events
    app.addEventListener('keydown', (event: any) => {
      app.defaultOnKeydown(event);
    });
    // handle window resize
    window.addEventListener('resize', app.onResize);

    // possible load from location
    // dwv.utils.loadFromUri(window.location.href, app);
    if (selectedImage.studyInstance) {
      DicomViewerService.fetchImageFile(selectedImage.studyInstance.series[selectedImage.index].imageId)
        .then((imgBlob: any) => {
          const myImage: any = document.querySelector('#dicomViewerImg');
          const urlCreator = window.URL || window.webkitURL;
          var objectURL = urlCreator.createObjectURL(imgBlob);
          if (myImage) myImage.src = objectURL;
          // app.loadURLs([objectURL]);
          // imgBlob['name'] = 'patientdata.dcm'
          // imgBlob['filename'] = 'patientdata.dcm'
          // console.log(app)
          // console.log(imgBlob)
          // app.loadImageObject([imgBlob]);
          // // console.log('setted dwvApp')
          const file = new File([imgBlob], 'PatientDicom.dcm', { type: 'application/dicom', lastModified: Date.now() })
          console.log(file)
          // console.log(file)
          app.loadFiles([file])
          // setDwvApp(app);
        })
    }

    // test using a drop box
    console.log(app)
    const layerContainer = app.getElement('layerContainer');
    console.log(layerContainer)
    if (layerContainer) {
      layerContainer.addEventListener('drop', onDrop);
    }
  }, [selectedImage, history])

  return (
    <div id="dwv" className="imgViewer">
      <DicomViewerHeader></DicomViewerHeader>
      <div className="layerContainer">
        <img className={`${isImgInverted ? 'invertImg' : ''}`} id="dicomViewerImg" alt="DICOM Viewer" />
      </div>
      {/* <div className="layerContainer">
        <canvas className="imageLayer">Only for HTML5 compatible browsers...</canvas>
        <div className="drawDiv"></div>
      </div> */}
      <DicomViewerBottomBox></DicomViewerBottomBox>
    </div>
  )
}

export default ViewImagePage;