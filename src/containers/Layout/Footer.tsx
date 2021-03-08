import {
  PageHeader,
  PageHeaderTools,
  PageHeaderToolsItem
} from "@patternfly/react-core";
import React from "react";
import { useHistory } from "react-router-dom";
import logo from "../../assets/images/logo-white.png";

const Footer: React.FC = () => {
  const history = useHistory();

  const pageToolbar = (
    <React.Fragment>
      <PageHeaderTools>
        <PageHeaderToolsItem>
          <p className="footer-text">An open-source neural network for disease detection created by&nbsp;
            <a href="https://www.darwinai.com/" target="_blank" rel="noopener noreferrer">DarwinAI</a>,&nbsp;
            <a href="http://chrisproject.org/" target="_blank" rel="noopener noreferrer">ChRIS</a>, and&nbsp;
            <a href="http://redhat.com/chris" target="_blank" rel="noopener noreferrer">RedHat</a>&nbsp;</p>
        </PageHeaderToolsItem>
      </PageHeaderTools>
      <PageHeaderTools className="footer-right">
        <PageHeaderToolsItem className="footer-link">
          <p className="footer-text">Find more about <a href="https://alexswong.github.io/COVID-Net/" target="_blank" rel="noopener noreferrer">COVID-Net&nbsp;</a>
          and <a href="https://github.com/darwinai/covidnet_ui" target="_blank" rel="noopener noreferrer">&nbsp;COVID-Net UI</a></p>
        </PageHeaderToolsItem>
      </PageHeaderTools>
    </React.Fragment>
  );

  return (<PageHeader
    className="footer"
    aria-label="Page Footer"
    headerTools={pageToolbar}
    logo={<img onClick={() => history.push("/")} src={logo} className="logo" alt="DarwinAI Logo" />}>
  </PageHeader>);
}

export default Footer;
