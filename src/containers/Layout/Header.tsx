import {
  Dropdown,
  DropdownItem,
  DropdownToggle,
  NotificationBadge,
  NotificationBadgeVariant,
  PageHeader,
  PageHeaderTools,
  PageHeaderToolsGroup,
  PageHeaderToolsItem
} from "@patternfly/react-core";
import { css } from "@patternfly/react-styles";
import accessibleStyles from "@patternfly/react-styles/css/utilities/Accessibility/accessibility";
import React from "react";
import { Link, useHistory } from "react-router-dom";
import logo from "../../assets/images/logo-white.png";
import { Types } from "../../context/actions/types";
import { AppContext } from "../../context/context";
import PageNav from "./PageNav";
import ChrisAPIClient from "../../api/chrisapiclient";

interface HeaderProps {
  onNotificationBadgeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNotificationBadgeClick }) => {
  const history = useHistory();
  const { state, dispatch } = React.useContext(AppContext);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)
  const username = state.user.username;

  const onDropdownSelect = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const logout = () => {
    window.sessionStorage.removeItem("AUTH_TOKEN");
    ChrisAPIClient.setIsTokenAuthorized(false);
    dispatch({
      type: Types.LOGOUT_UPDATE,
      payload: null
    });
    history.push("/login")
  }

  const userDropdownItems = [
    <DropdownItem key={"Sign out"} onClick={logout} >Sign out</DropdownItem>,
  ];

  const pageToolbar = state.user.loggedIn ? (
    <PageHeaderTools>
      <PageHeaderToolsItem>
        <NotificationBadge
<<<<<<< HEAD
          variant="read"
=======
          variant={NotificationBadgeVariant.read}
>>>>>>> 66b2fd66c18b5f6e717ae0926a6e408ad69adc91
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
    logo={<>
      <img onClick={() => history.push("/")} src={logo} className="logo" alt="DarwinAI Logo" />
      <Link to="/" className="logo-text">COVID-Net</Link>
    </>}
    logoComponent={"div"}
    topNav={<PageNav />}
  />;
}


export default Header;
