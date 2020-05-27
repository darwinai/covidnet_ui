import * as React from "react";
import {
  Dropdown,
  DropdownToggle,
  PageHeader,
  Toolbar,
  ToolbarItem,
  ToolbarGroup,
} from "@patternfly/react-core";
import accessibleStyles from '@patternfly/react-styles/css/utilities/Accessibility/accessibility';
import spacingStyles from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { css } from '@patternfly/react-styles';
import { BellIcon, CogIcon } from '@patternfly/react-icons';
import Sidebar from "./Sidebar";
import { Link } from "react-router-dom";


interface IHeaderProps {
  onSidebarToggle: () => void;
}

class Header extends React.Component<IHeaderProps> {
  render() {
    const { onSidebarToggle } = this.props;
    //const pageToolbar = <Link to="/login">Log In</Link>;
    const pageToolbar = (
      <Toolbar>
        <ToolbarGroup>
          <ToolbarItem className={css(accessibleStyles.screenReader, accessibleStyles.visibleOnMd)}>
            <Dropdown
              isPlain
              position="right"
              toggle={<DropdownToggle>Dr. Chris Covid</DropdownToggle>}
            />
          </ToolbarItem>
        </ToolbarGroup>
      </Toolbar>
    )

    return <PageHeader
      className="header"
      aria-label="Page Header"
      toolbar={pageToolbar}
      logo={<span className='logo-text'>COVID-Net</span>}
      topNav={<Sidebar />}
      onNavToggle={onSidebarToggle}
    />;
  }
}

export default Header;
