import { Button } from '@patternfly/react-core';
import { ArrowRightIcon } from '@patternfly/react-icons';
import React from "react";

interface RightArrowButtonProps { 
  click?: () => void, 
  className?: string,
  type?: "button" | "submit" | "reset" | undefined
}

const RightArrowButton: React.FC<RightArrowButtonProps> = ({click, className,  type, children}) => {
  return (
    <Button className={className} variant="primary" onClick={click} type={type}>
      {children} <ArrowRightIcon></ArrowRightIcon>
    </Button>
  )
}

export default RightArrowButton;
