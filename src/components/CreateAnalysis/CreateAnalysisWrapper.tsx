import React, { useEffect, useState } from "react";
import {
  Drawer,
  DrawerPanelContent,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerActions,
  DrawerCloseButton,
} from '@patternfly/react-core';
import ConfirmAnalysis from './ConfirmAnalysis'
import CreateAnalysisDetail from "./CreateAnalysisDetail";

const CreateAnalysisWrapper = () => {
  const [isExpanded, setIsExpanded] = useState(false)

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
        <ConfirmAnalysis></ConfirmAnalysis>
      </DrawerContentBody>
    </DrawerPanelContent>
  );

  return (
    <Drawer isExpanded={isExpanded}>
      <DrawerContent panelContent={panelContent}>
        <DrawerContentBody>
          <CreateAnalysisDetail setIsExpanded={setIsExpanded}>
          </CreateAnalysisDetail>
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  )
}

export default CreateAnalysisWrapper;