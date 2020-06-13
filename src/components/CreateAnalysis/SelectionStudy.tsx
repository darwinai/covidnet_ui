import React from "react";
import { Badge } from '@patternfly/react-core';

const SelectionStudy = () => {

  const categoryName = "XRAY"
  return (
    <div className="SelectionStudy selected">
      <h1 className="blueText"><Badge>1</Badge> Patient Study A</h1>
      <p className="greyText"><span className="outtline-box">{categoryName}</span> 2019 11 30</p>
    </div>
  )
}

export default SelectionStudy;