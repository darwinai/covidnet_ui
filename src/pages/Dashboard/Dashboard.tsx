import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import Wrapper from "../../containers/Layout/PageWrapper";
import { PageSection, PageSectionVariants } from "@patternfly/react-core";

type AllProps = RouteComponentProps;

class DashboardPage extends React.Component<AllProps> {
  componentDidMount() {
    document.title = "Dashboard - ChRIS UI site";
  }

  render() {
    const { children } = this.props;
    return (
      <Wrapper>
        <PageSection variant={PageSectionVariants.darker}>
          <h1>Sample Header</h1>
        </PageSection>
        <PageSection>
          {children}
        </PageSection>
      </Wrapper>
    );
  }
}


export { DashboardPage as Dashboard };
