import { Drawer, DrawerActions, DrawerCloseButton, DrawerContent, DrawerContentBody, DrawerHead, DrawerPanelContent, Modal } from "@patternfly/react-core";
import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import { GeneratePredictionTypes, NotificationActionTypes } from "../../context/actions/types";
import { AppContext } from "../../context/context";
import { DcmImage } from "../../context/reducers/dicomImagesReducer";
import GeneratePredictionService from "../../services/GeneratePredictionService";
import ConfirmAnalysis from "./ConfirmAnalysis";
import GeneratePredictionDetail from "./GeneratePredictionDetail";
import pacs_integration from "../../services/pacs_integration";
import chris_integration from "../../services/chris_integration";
import { NotificationItem } from "../../context/reducers/notificationReducer";

const GeneratePredictionWrapper = () => {
  const { state: { dcmImages, models, generatePrediction: { selectedStudyUIDs } }, dispatch } = useContext(AppContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const history = useHistory();

  const submitAnalysis = async () => {
    let imagesSelected: DcmImage[] = GeneratePredictionService.pickImages(dcmImages?.allDcmImages, selectedStudyUIDs);
    if (imagesSelected.length <= 0) {
      setIsModalOpen(true);
      return;
    }

    if (process.env.REACT_APP_CHRIS_UI_DICOM_SOURCE === 'pacs') {
      // Send request to have DICOM files pushed from PACS server to pypx
      const retrievePromises: Promise<boolean>[] = [];
      imagesSelected.forEach((image: DcmImage) => {
        retrievePromises.push(pacs_integration.retrievePatientFiles(image.StudyInstanceUID, image.SeriesInstanceUID))
      })
      const retrieveResults = await Promise.allSettled(retrievePromises);
      retrieveResults.forEach(result => {
        if (result.status !== 'fulfilled') {
          console.error('Unable to initiate PACS retrieve');
          return;
        }
      });

      // Update fname property of each image to be the filepath in Swift filesystem
      try {
        imagesSelected = await Promise.all(imagesSelected.map(async (image: DcmImage) => ({
          ...image,
          fname: await chris_integration.getFilePathNameByUID(image.StudyInstanceUID, image.SeriesInstanceUID)
        })));
      } catch (err) {
        console.error(err);
      }
    }

    // Processing the images
    // Passing selected models to Chris_Integration for image analysis
    const notifications: NotificationItem[] = await GeneratePredictionService.analyzeImages(imagesSelected, models.xrayModel, models.ctModel);

    dispatch({
      type: NotificationActionTypes.SEND,
      payload: { notifications }
    });
    
    history.push("/pastPredictions");

    dispatch({
      type: GeneratePredictionTypes.Clear_selected_studies_UID
    });
  }

  const panelContent = (
    <DrawerPanelContent className="rightBar">
      <DrawerHead>
        <div className="rightbarTitle">
          <h1>Selected Images:</h1>
        </div>
        <DrawerActions>
          <DrawerCloseButton onClick={() => setIsExpanded(false)} />
        </DrawerActions>
      </DrawerHead>
      <DrawerContentBody>
        <ConfirmAnalysis submit={submitAnalysis}></ConfirmAnalysis>
      </DrawerContentBody>
    </DrawerPanelContent>
  );

  return (
    <Drawer isExpanded={isExpanded}>
      <Modal
        title="Error"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        Please select at least 1 image to analyze
      </Modal>
      <DrawerContent panelContent={panelContent}>
        <DrawerContentBody>
          <GeneratePredictionDetail setIsExpanded={setIsExpanded} submitAnalysis={submitAnalysis}>
          </GeneratePredictionDetail>
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  )
}

export default GeneratePredictionWrapper;