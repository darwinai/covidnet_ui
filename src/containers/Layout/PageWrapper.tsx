import * as React from "react";

import { Page } from "@patternfly/react-core";
import Header from "./Header";
import "./layout.scss";


class Wrapper extends React.Component {
  // Description: toggles sidebar on pageresize
  render() {
    const { children } = this.props;

    return (
      <Page
        className="pf-background"
        header={<Header/>}
      >
        {children}
      </Page>
    );
  }
}

export default Wrapper;
