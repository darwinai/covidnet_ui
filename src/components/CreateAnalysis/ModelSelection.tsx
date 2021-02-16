import React, { SyntheticEvent, useEffect, useState } from 'react'
import plugins from '../../api/app.config'
import {
    Dropdown,
    DropdownToggle,
    DropdownItem
  } from '@patternfly/react-core';
  import CaretDownIcon from '@patternfly/react-icons/dist/js/icons/caret-down-icon';

interface ModelSelectionProps {
    isXray: boolean,
    handleXrayChange: (model: string) => void,
    handleCTChange: (model: string) => void,
    xrayValue: string,
    ctValue: string
  }

const ModelSelection: React.FC<ModelSelectionProps> = ({isXray, handleCTChange, handleXrayChange, xrayValue, ctValue}) => { // Drop-down for selecting which model to use when performing analysis

    const [isOpen, setIsOpen] = useState(false);
    const [dropdownValue, setDropdownValue] = useState((isXray) ? xrayValue : ctValue);

    useEffect(() => { // Display the currently chosen Xray/CT model
      setDropdownValue((isXray) ? xrayValue : ctValue);
    }, [isXray, ctValue, xrayValue])
      
    const onSelect = (event: SyntheticEvent<HTMLDivElement, Event> | undefined) => {
        setIsOpen(!isOpen);
        
        if (event !== undefined) {
            if (isXray) {
                handleXrayChange(event.currentTarget.innerText);
            } else {
                handleCTChange(event.currentTarget.innerText);
            }
            setDropdownValue(event.currentTarget.innerText);
        }
      };

      let dropdownItems = Object.keys(isXray ? plugins.XrayModels : plugins.CTModels).map((key: string) => {
        return (<DropdownItem key={key}>{key}</DropdownItem>);
      });

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