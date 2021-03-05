import {
  PageHeader,
  PageHeaderTools,
  PageHeaderToolsItem
} from "@patternfly/react-core";
import React from "react";
import { useHistory } from 'react-router-dom';
import logo from "../../assets/images/logo-white.png";
import github from "../../assets/images/githubLogo.png";
import chris from "../../assets/images/ChRISLogo.png"

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
      <PageHeaderTools>
        <PageHeaderToolsItem className="footer-link">
          <p className="footer-text">Find more about COVID-Net&nbsp;<a href="https://alexswong.github.io/COVID-Net/" target="_blank" rel="noopener noreferrer">here.&nbsp;</a></p>
          <p className="footer-text">And the COVID-Net UI project&nbsp;<a href="https://github.com/darwinai/covidnet_ui" target="_blank" rel="noopener noreferrer">here:</a></p>
          <a href="https://github.com/darwinai/covidnet_ui" target="_blank" rel="noopener noreferrer"><img src={github} className="footer-logo" alt="darwinAI" /></a>
        </PageHeaderToolsItem>
      </PageHeaderTools>
    </React.Fragment>
  );

  return (<PageHeader
    className="footer"
    aria-label="Page Footer"
    headerTools={pageToolbar}
    logo={(<a
      onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => { history.push('/'); e.preventDefault() }}
      href="/#"><img src={logo} className="logo" alt="darwinAI" height="300px" width="190px" />
    </a>)}>
  </PageHeader>);
}


export default Footer;
