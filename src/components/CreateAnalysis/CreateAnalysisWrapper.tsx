import { Drawer, DrawerActions, DrawerCloseButton, DrawerContent, DrawerContentBody, DrawerHead, DrawerPanelContent, Modal } from '@patternfly/react-core';
import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import { StagingDcmImagesTypes } from '../../context/actions/types';
import { AppContext } from '../../context/context';
import { DcmImage } from "../../context/reducers/dicomImagesReducer";
import CreateAnalysisService from "../../services/CreateAnalysisService";
import ConfirmAnalysis from './ConfirmAnalysis';
import CreateAnalysisDetail from "./CreateAnalysisDetail";

const CreateAnalysisWrapper = () => {
  const { state: { dcmImages, createAnalysis: { selectedStudyUIDs } }, dispatch } = useContext(AppContext)
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const history = useHistory();

  const submitAnalysis = (XrayModel: string | void, CTModel: string | void) => {
    return () => {
      const imagesSelected: DcmImage[] = CreateAnalysisService.pickImages(dcmImages, selectedStudyUIDs);
      if (imagesSelected.length <= 0) {
        setIsModalOpen(true);
        return;
      }
      // update staging images
      dispatch({
        type: StagingDcmImagesTypes.UpdateStaging,
        payload: { imgs: imagesSelected }
      })
      history.push({
        pathname: "/", //describe this as interface and not use any.
        state: { 
          XrayModel: XrayModel,
          CTModel: CTModel
        }});
    }
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