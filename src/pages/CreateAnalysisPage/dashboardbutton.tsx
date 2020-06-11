import React from "react";
import { Button } from '@patternfly/react-core';
import { ArrowRightIcon } from '@patternfly/react-icons';

const DashboardButton = (props: { click: () => void }) => {
  return (
    <Button variant="primary" onClick={props.click}>
      Continue <ArrowRightIcon></ArrowRightIcon>
    </Button>
  )
}

export default DashboardButton;