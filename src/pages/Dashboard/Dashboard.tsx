import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import Wrapper from "../../containers/Layout/PageWrapper";
import { PageSection, PageSectionVariants } from "@patternfly/react-core";
import { CreateAnalysisSection } from "../../components/CreateAnalysis";

type AllProps = RouteComponentProps;

class DashboardPage extends React.Component<AllProps> {
  componentDidMount() {
    document.title = "Anayalsis - CovidNet ui";
  }

  render() {
    const { children } = this.props;
    return (
      <Wrapper>
        <PageSection variant={PageSectionVariants.light}>
          <h1 className='board-title'>Dashboard</h1>
        </PageSection>
        <PageSection>
          <CreateAnalysisSection/>
          {children}
        </PageSection>
      </Wrapper>
    );
  }
}


export { DashboardPage as Dashboard };
