import { 
  Dropdown, 
  DropdownItem, 
  DropdownToggle, 
  PageHeader, 
  Toolbar, 
  ToolbarGroup, 
  ToolbarItem } from "@patternfly/react-core";
import { css } from '@patternfly/react-styles';
import accessibleStyles from '@patternfly/react-styles/css/utilities/Accessibility/accessibility';
import React from "react";
import { Link, useHistory } from 'react-router-dom';
import logo from "../../assets/images/logo-white.png";
import { Types } from "../../context/actions/types";
import { AppContext } from "../../context/context";
import TopBar from "./TopBar";

const Header = () => {
  const history = useHistory()
  const { state, dispatch } = React.useContext(AppContext);
  //const pageToolbar = <Link to="/login">Log In</Link>;
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)

  const onDropdownSelect = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const logout = () => {
    window.sessionStorage.removeItem("AUTH_TOKEN");
    window.sessionStorage.removeItem("USERNAME");
    dispatch({
      type: Types.Logout_update,
      payload: null
    })
    history.push('/login')
  }

  const userDropdownItems = [
    <DropdownItem key={'Sign out'} onClick={logout} >Sign out</DropdownItem>,
  ];

  const pageToolbar = state.user.loggedIn ? (
    <Toolbar>
      <ToolbarGroup>
        <ToolbarItem className={css(accessibleStyles.screenReader, accessibleStyles.visibleOnMd)}>
          <Dropdown
            isPlain
            position="right"
            toggle={<DropdownToggle onToggle={(isOpen: boolean) => setIsDropdownOpen(isOpen)}>Dr. Chris Covid</DropdownToggle>}
            isOpen={isDropdownOpen}
            onSelect={onDropdownSelect}
            dropdownItems={userDropdownItems}
          />
        </ToolbarItem>
      </ToolbarGroup>
    </Toolbar>
  ) : (<Link to="/login">Log In</Link>)

  return <PageHeader
    className="header"
    aria-label="Page Header"
    toolbar={pageToolbar}
    logo={(<React.Fragment><img src={logo} className="logo" alt="darwinAI" height="300px" width="190px"/>
    <span className='logo-text'>COVID-Net</span></React.Fragment>)}
    topNav={<TopBar />}
  />;
}


export default Header;
