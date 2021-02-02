import { Drawer, DrawerActions, DrawerCloseButton, DrawerContent, DrawerContentBody, DrawerHead, DrawerPanelContent, Modal } from '@patternfly/react-core';
import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import { StagingDcmImagesTypes } from '../../context/actions/types';
import { AppContext } from '../../context/context';
import { DcmImage } from "../../context/reducers/dicomImagesReducer";
import CreateAnalysisService from "../../services/CreateAnalysisService";
import ConfirmAnalysis from './ConfirmAnalysis';
import CreateAnalysisDetail from "./CreateAnalysisDetail";
import pacs_integration from '../../services/pacs_integration';

const CreateAnalysisWrapper = () => {
  const { state: { dcmImages, createAnalysis: { selectedStudyUIDs } }, dispatch } = useContext(AppContext)
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const history = useHistory();

  const submitAnalysis = () => {
    const imagesSelected: DcmImage[] = CreateAnalysisService.pickImages(dcmImages.filteredDcmImages, selectedStudyUIDs);
    console.log(dcmImages);
    if (imagesSelected.length <= 0) {
      setIsModalOpen(true);
      return;
    }
    // Send request to have PACS files pushed from PACS server
    imagesSelected.forEach(dcmImage => {
      pacs_integration.retrievePatientFiles(dcmImage.StudyInstanceUID, dcmImage.SeriesInstanceUID)
    })
    // update staging images
    dispatch({
      type: StagingDcmImagesTypes.UpdateStaging,
      payload: { imgs: imagesSelected }
    })
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