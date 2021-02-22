import {
    PageHeader,
    PageHeaderTools,
    PageHeaderToolsItem
  } from "@patternfly/react-core";
  import React from "react";
  import { useHistory } from 'react-router-dom';
  import logo from "../../assets/images/logo-white.png";
  import github from "../../assets/images/githubLogo.png";
  
  const Footer: React.FC = () => {
    const history = useHistory();
  
    const pageToolbar = (
        <React.Fragment>
            <PageHeaderTools>
                <PageHeaderToolsItem>
                    <p className="footerText">An open-source neural network for disease detection created by 
                    <a href="https://www.darwinai.com/" target="_blank" rel="noopener noreferrer"> DarwinAI</a>, 
                    <a href="https://www.redhat.com/en" target="_blank" rel="noopener noreferrer"> RedHat</a>, and 
                    <a href="https://www.childrenshospital.org/" target="_blank" rel="noopener noreferrer"> Boston Children's Hospital</a></p>
                </PageHeaderToolsItem>
            </PageHeaderTools>
                <PageHeaderTools>
                    <PageHeaderToolsItem className="footerLink">
                        <p className="footerText">Find the Covid-Net project <a href="https://github.com/darwinai" target="_blank" rel="noopener noreferrer">here:</a></p>
                        <a href="https://github.com/darwinai" target="_blank" rel="noopener noreferrer"><img src={github} className="footerLogo" alt="darwinAI"/></a>
                    </PageHeaderToolsItem>
            </PageHeaderTools>
        </React.Fragment>
    );
  
    return (<PageHeader
      className="footer"
      aria-label="Page Footer"
      headerTools={pageToolbar}
      logo={(<React.Fragment><a onClick={() => history.push('/')} href="/#"><img src={logo} className="logo" alt="darwinAI" height="300px" width="190px"/></a></React.Fragment>)}>
    </PageHeader>);
  }
  
  
  export default Footer;
  