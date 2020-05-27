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
import { css } from '@patternfly/react-styles';
import Sidebar from "./Sidebar";


class Header extends React.Component {
  render() {
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
    />;
  }
}

export default Header;
