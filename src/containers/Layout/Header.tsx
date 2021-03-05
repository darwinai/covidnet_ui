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

interface HeaderProps {
  onNotificationBadgeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNotificationBadgeClick }) => {
  const history = useHistory()
  const { state, dispatch } = React.useContext(AppContext);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)
  const username = state.user.username;

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

  const variant = state.notifications.length > 0
    ? state.notifications.some(notification => notification.variant === NotificationItemVariant.DANGER)
      ? "attention" : "unread"
      : "read";

  const pageToolbar = state.user.loggedIn ? (
    <PageHeaderTools>
      <PageHeaderToolsItem>
        <NotificationBadge
          variant={variant}
          count={state.notifications.length}
          onClick={onNotificationBadgeClick}
          aria-label="Notifications">
        </NotificationBadge>
      </PageHeaderToolsItem>
      <PageHeaderToolsGroup>
        <PageHeaderToolsItem className={css(accessibleStyles.screenReader, accessibleStyles.visibleOnMd)}>
          <Dropdown
            isPlain
            position="right"
            toggle={<DropdownToggle onToggle={(isOpen: boolean) => setIsDropdownOpen(isOpen)}>{username}</DropdownToggle>}
            isOpen={isDropdownOpen}
            onSelect={onDropdownSelect}
            dropdownItems={userDropdownItems}
          />
        </PageHeaderToolsItem>
      </PageHeaderToolsGroup>
    </PageHeaderTools>
  ) : (<Link to="/login">Log In</Link>)

  return <PageHeader
    className="header"
    aria-label="Page Header"
    headerTools={pageToolbar}
    logo={(<React.Fragment><img src={logo} className="logo" alt="darwinAI" height="300px" width="190px"/>
    <span className='logo-text'>COVID-Net</span></React.Fragment>)}
    topNav={<PageNav />}
  />;
}


export default Header;
