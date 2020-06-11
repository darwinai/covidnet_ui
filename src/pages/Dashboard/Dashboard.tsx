import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import Wrapper from "../../containers/Layout/PageWrapper";
import { PageSection, PageSectionVariants } from "@patternfly/react-core";
import { CreateAnalysisSection } from "../../components/CreateAnalysis/CreateAnalysis";
import PastAnalysis from "../../components/PastAnalyses";

type AllProps = RouteComponentProps;

class DashboardPage extends React.Component<AllProps> {
  componentDidMount() {
    document.title = "Anayalsis - CovidNet ui";
  }

  render() {
    // const { children } = this.props;
    return (
      <Wrapper>
        <PageSection variant={PageSectionVariants.light}>
          <h1 className='board-title'>Dashboard</h1>
        </PageSection>
        <PageSection>
          <PageSection className='sectionArea' variant={PageSectionVariants.light}>
            <CreateAnalysisSection />
          </PageSection>
          <PageSection variant={PageSectionVariants.light}>
            <PastAnalysis></PastAnalysis>
          </PageSection>
        </PageSection>
      </Wrapper>
    );
  }
}


export { DashboardPage as Dashboard };
