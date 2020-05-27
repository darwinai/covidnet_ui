import * as React from "react";
import {
    PageHeader,
} from "@patternfly/react-core";
import Sidebar from "./Sidebar";

interface IHeaderProps {
  onSidebarToggle: () => void;
}

class Header extends React.Component<IHeaderProps> {
  render() {
    const { onSidebarToggle } = this.props;

    return <PageHeader 
      className="header"
      aria-label="Page Header"
      logo={<span className='logo-text'>COVID-Net</span>}
      showNavToggle
      topNav={<Sidebar/>}
      onNavToggle={onSidebarToggle}
    />;
  }
}

export default Header;
