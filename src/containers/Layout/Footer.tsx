import {
    Dropdown,
    DropdownItem,
    DropdownToggle,
    NotificationBadge,
    PageHeader,
    PageHeaderTools,
    PageHeaderToolsGroup,
    PageHeaderToolsItem
  } from "@patternfly/react-core";
  import { css } from '@patternfly/react-styles';
  import accessibleStyles from '@patternfly/react-styles/css/utilities/Accessibility/accessibility';
  import React from "react";
  import { Link, useHistory } from 'react-router-dom';
  import logo from "../../assets/images/logo-white.png";
  import { Types } from "../../context/actions/types";
  import { AppContext } from "../../context/context";
  import { NotificationItemVariant } from "../../context/reducers/notificationReducer";
  import PageNav from "./PageNav";
  
  const Header: React.FC = () => {
  
    const pageToolbar = (
      <PageHeaderTools>
      </PageHeaderTools>
    );
  
    return <PageHeader
      className="footer"
      aria-label="Page Footer"
      headerTools={pageToolbar}
      logo={(<React.Fragment><img src={logo} className="logo" alt="darwinAI" height="300px" width="190px"/>
      <span className='logo-text'>COVID-Net</span></React.Fragment>)}
    />;
  }
  
  
  export default Header;
  