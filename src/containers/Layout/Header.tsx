import * as React from "react";
import {
    PageHeader,
} from "@patternfly/react-core";

interface IHeaderProps {
  onSidebarToggle: () => void;
}

class Header extends React.Component<IHeaderProps> {
  render() {
    const { onSidebarToggle } = this.props;

    return <PageHeader 
      className="header"
      aria-label="Page Header"
      showNavToggle
      onNavToggle={onSidebarToggle}
    />;
  }
}

export default Header;
