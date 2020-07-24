import React from "react";
import WarningIcon from '@material-ui/icons/Warning';

interface ErrorProps {
  children: React.ReactNode
}

const Error: React.FC<ErrorProps> = ({ children }) => (
  <div className="noImagesFound">
    <WarningIcon style={{ fontSize: 60 }}></WarningIcon>
    <p>{children}</p>
  </div>
)

export default Error;
