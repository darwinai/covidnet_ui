import {
  PageHeader,
  PageHeaderTools,
  PageHeaderToolsItem
} from "@patternfly/react-core";
import React from "react";

interface FooterProps {
  isLogin?: boolean
}


const Footer: React.FC<FooterProps> = ({ isLogin }) => {

  const pageToolbar = (
    <div className="footer-content">
      <PageHeaderTools>
        <PageHeaderToolsItem>
          <p className="footer-text">An open source clinical decision support UI platform created by&nbsp;
            <a href="https://www.darwinai.com/" target="_blank" rel="noopener noreferrer">DarwinAI</a>,&nbsp;
            <a href="https://chrisproject.org/" target="_blank" rel="noopener noreferrer">ChRIS</a>, and&nbsp;
            <a href="https://redhat.com/chris" target="_blank" rel="noopener noreferrer">RedHat</a>&nbsp;</p>
        </PageHeaderToolsItem>
      </PageHeaderTools>
      <PageHeaderTools>
        <PageHeaderToolsItem className="footer-link">
          <p className="footer-text">
            Find more about&nbsp;
            <a href="https://alexswong.github.io/COVID-Net/" target="_blank" rel="noopener noreferrer">COVID-Net</a>
            &nbsp;and&nbsp;
            <a href="https://github.com/darwinai/covidnet_ui" target="_blank" rel="noopener noreferrer">COVID-Net UI</a>
          </p>
        </PageHeaderToolsItem>
      </PageHeaderTools>
      </div>
  );

  return (<PageHeader
    className="footer"
    aria-label="Page Footer"
    headerTools={pageToolbar}
    style={ isLogin ? { backgroundColor: 'black' } : {}}>
  </PageHeader>);
}

export default Footer;
