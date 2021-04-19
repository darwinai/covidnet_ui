import React, { SyntheticEvent, useContext, useEffect, useState } from "react";
import { PluginModels } from "../../api/app.config";
import {
    Dropdown,
    DropdownToggle,
    DropdownItem
  } from "@patternfly/react-core";
import CaretDownIcon from "@patternfly/react-icons/dist/js/icons/caret-down-icon";
import { UpdatingModelSelectionTypes } from "../../context/actions/types";
import { AppContext } from "../../context/context";

interface ModelSelectionProps {
    isXray: boolean
  }

const ModelSelection: React.FC<ModelSelectionProps> = ({isXray}) => { // Drop-down for selecting which model to use when performing analysis

    const [isOpen, setIsOpen] = useState(false);
    const { state: { models }, dispatch } = useContext(AppContext);
    const [dropdownValue, setDropdownValue] = useState(isXray ? models.xrayModel : models.ctModel);

    useEffect(() => { // Display the currently chosen Xray/CT model
      setDropdownValue(isXray ? models.xrayModel : models.ctModel);
    }, [isXray, models.xrayModel, models.ctModel]);

    const onSelect = (event?: SyntheticEvent<HTMLDivElement, Event>) => {
        setIsOpen(!isOpen);

        if (event) {
            if (isXray) {
              dispatch({
                type: UpdatingModelSelectionTypes.XrayModelSelection,
                payload: {
                  xrayModel: event.currentTarget.innerText
                }
              });
            } else {
              dispatch({ // Updating analysis models to selected options through the drop-down
                type: UpdatingModelSelectionTypes.CTModelSelection,
                payload: {
                  ctModel: event.currentTarget.innerText
                }
              });
            }
            setDropdownValue(event.currentTarget.innerText);
        }
      };

    const dropdownItems = Object.keys(isXray ? PluginModels.XrayModels : PluginModels.CTModels).map((key: string) => (<DropdownItem key={key}>{key}</DropdownItem>));

    return (
      <React.Fragment>
        <label className="dropdown-label">Select a model</label>
        <Dropdown
          onSelect={onSelect}
          toggle={
            <DropdownToggle onToggle={setIsOpen} toggleIndicator={CaretDownIcon} isPrimary id="toggle-id-4">
              {dropdownValue}
            </DropdownToggle>
          }
          isOpen={isOpen}
          dropdownItems={dropdownItems}
        />
      </React.Fragment>
      );
}

export default ModelSelection;
