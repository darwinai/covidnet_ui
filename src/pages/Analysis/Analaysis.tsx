import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import Wrapper from "../../containers/Layout/PageWrapper";
import { PageSection, PageSectionVariants } from "@patternfly/react-core";

type AllProps = RouteComponentProps;

class AnalysisPage extends React.Component<AllProps> {
  componentDidMount() {
    document.title = "Anayalsis - CovidNet ui";
  }

  render() {
    const { children } = this.props;
    return (
      <Wrapper>
        <PageSection variant={PageSectionVariants.light}>
          <h1>Predicative Analysis</h1>
        </PageSection>
        <PageSection>
          {children}
        </PageSection>
      </Wrapper>
    );
  }
}


export { AnalysisPage as AnalysisDashboard };
