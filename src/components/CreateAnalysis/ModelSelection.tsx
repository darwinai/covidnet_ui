import React, { SyntheticEvent, useEffect, useState } from 'react'
import plugins from '../../api/app.config'
import {
    Dropdown,
    DropdownToggle,
    DropdownItem
  } from '@patternfly/react-core';
  import CaretDownIcon from '@patternfly/react-icons/dist/js/icons/caret-down-icon';

interface ModelSelectionProps {
    useXray: boolean,
    handleXrayChange: (model: string) => void,
    handleCTChange: (model: string) => void,
    xrayValue: string,
    ctValue: string
  }

const ModelSelection: React.FC<ModelSelectionProps> = (props) => { // Drop-down for selecting which model to use when performing analysis

    const [isOpen, setIsOpen] = useState(false);
    const [dropdownValue, setDropdownValue] = useState((props.useXray) ? props.xrayValue : props.ctValue);

    useEffect(() => { // Display the currently chosen Xray/CT model
      setDropdownValue((props.useXray) ? props.xrayValue : props.ctValue);
    }, [props.useXray, props.ctValue, props.xrayValue])

    const onToggle = (isOpen: boolean) => {
        setIsOpen(isOpen);
      };
      
    const onSelect = (event: SyntheticEvent<HTMLDivElement, Event> | undefined) => {
        setIsOpen(!isOpen);
        
        if (event !== undefined) {
            if (props.useXray) {
                props.handleXrayChange(event.currentTarget.innerText);
            } else {
                props.handleCTChange(event.currentTarget.innerText);
            }
            setDropdownValue(event.currentTarget.innerText);
        }
      };

      let dropdownItems: any = [];

      if (props.useXray) {
        for (const [key] of Object.entries(plugins.XrayModels)) {
            dropdownItems.push(<DropdownItem key={key}>{key}</DropdownItem>);            
        }
      } else {
        for (const [key] of Object.entries(plugins.CTModels)) {
            dropdownItems.push(<DropdownItem key={key}>{key}</DropdownItem>);     
        }
      }

    return (
      <React.Fragment>
        <label className="dropdown-label">Select a model</label>
        <Dropdown
          onSelect={onSelect}
          toggle={
            <DropdownToggle onToggle={onToggle} toggleIndicator={CaretDownIcon} isPrimary id="toggle-id-4">
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