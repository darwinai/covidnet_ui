import React from "react";
import { Button } from '@patternfly/react-core';
import { ArrowRightIcon } from '@patternfly/react-icons';

interface RightArrowButtonProps { 
  click: () => void 
  className?: string
}

const RightArrowButton: React.FC<RightArrowButtonProps> = ({click, className, children}) => {
  return (
    <Button className={className} variant="primary" onClick={click}>
      {children} <ArrowRightIcon></ArrowRightIcon>
    </Button>
  )
}

export default RightArrowButton;