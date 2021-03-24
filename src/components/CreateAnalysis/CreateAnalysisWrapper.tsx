import { Drawer, DrawerActions, DrawerCloseButton, DrawerContent, DrawerContentBody, DrawerHead, DrawerPanelContent, Modal } from "@patternfly/react-core";
import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import { StagingDcmImagesTypes, CreateAnalysisTypes } from "../../context/actions/types";
import { AppContext } from "../../context/context";
import { DcmImage } from "../../context/reducers/dicomImagesReducer";
import CreateAnalysisService from "../../services/CreateAnalysisService";
import ConfirmAnalysis from "./ConfirmAnalysis";
import CreateAnalysisDetail from "./CreateAnalysisDetail";
import pacs_integration from "../../services/pacs_integration";
import chris_integration from "../../services/chris_integration";

const CreateAnalysisWrapper = () => {
  const { state: { dcmImages, createAnalysis: { selectedStudyUIDs } }, dispatch } = useContext(AppContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const history = useHistory();

  const submitAnalysis = async () => {
    let imagesSelected: DcmImage[] = CreateAnalysisService.pickImages(dcmImages?.allDcmImages, selectedStudyUIDs);
    if (imagesSelected.length <= 0) {
      setIsModalOpen(true);
      return;
    }
    
    if (process.env.REACT_APP_CHRIS_UI_DICOM_SOURCE === "pacs") {
      // Send request to have DICOM files pushed from PACS server to pypx
      const retrievePromises: Promise<boolean>[] = [];
      imagesSelected.forEach((image: DcmImage) => {
        retrievePromises.push(pacs_integration.retrievePatientFiles(image.StudyInstanceUID, image.SeriesInstanceUID))
      })
      const retrieveResults = await Promise.allSettled(retrievePromises);
      retrieveResults.forEach(result => {
        if (result.status !== "fulfilled") {
          console.error("Unable to initiate PACS retrieve");
          return;
        }
      })

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

    // Updating staging images
    dispatch({
      type: StagingDcmImagesTypes.UpdateStaging,
      payload: { imgs: imagesSelected }
    });

    dispatch({
      type: CreateAnalysisTypes.Clear_selected_studies_UID
    });
    history.push("/");
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
          <CreateAnalysisDetail setIsExpanded={setIsExpanded} submitAnalysis={submitAnalysis}>
          </CreateAnalysisDetail>
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  )
}

export default CreateAnalysisWrapper;
