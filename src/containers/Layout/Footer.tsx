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
                    <a href="https://www.redhat.com/en" target="_blank" rel="noopener noreferrer">RedHat</a>, and&nbsp;
                    <a href="https://www.childrenshospital.org/" target="_blank" rel="noopener noreferrer">Boston Children's Hospital</a></p>
                </PageHeaderToolsItem>
            </PageHeaderTools>
            <PageHeaderTools>
                <PageHeaderToolsItem className="footer-link">
                    <p className="footer-text">Find the Covid-Net project&nbsp;<a href="https://github.com/darwinai" target="_blank" rel="noopener noreferrer">here:</a></p>
                    <a href="https://github.com/darwinai" target="_blank" rel="noopener noreferrer"><img src={github} className="footer-logo" alt="darwinAI"/></a>
                    <p className="footer-text">And the ChRIS project&nbsp;<a href="http://chrisproject.org/" target="_blank" rel="noopener noreferrer">here:</a></p>
                    <a href="http://chrisproject.org/" target="_blank" rel="noopener noreferrer"><img src={chris} className="footer-logo" alt="ChRIS"/></a>
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
        href="/#"><img src={logo} className="logo" alt="darwinAI" height="300px" width="190px"/>
        </a>)}>
    </PageHeader>);
  }
  
  
  export default Footer;
  