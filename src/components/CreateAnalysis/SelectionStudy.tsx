import React from "react";
import { Badge } from '@patternfly/react-core';

const SelectionStudy = () => {

  const categoryName = "XRAY"
  return (
    <div className="SelectionStudy selected">
      <h1><Badge>1</Badge> Patient Study A</h1>
      <p><span className="studyType">{categoryName}</span> 2019 11 30</p>
    </div>
  )
}

export default SelectionStudy;