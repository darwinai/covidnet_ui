import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import Wrapper from "../../containers/Layout/PageWrapper";
import { PageSection, PageSectionVariants } from "@patternfly/react-core";
import { CreateAnalysisSection } from "../../components/CreateAnalysis";
import { testAnalysis } from '../../services/analysis'

type AllProps = RouteComponentProps;

class DashboardPage extends React.Component<AllProps> {
  componentDidMount() {
    document.title = "Anayalsis - CovidNet ui";
    testAnalysis()
  }

  render() {
    // const { children } = this.props;
    return (
      <Wrapper>
        <PageSection variant={PageSectionVariants.light}>
          <h1 className='board-title'>Dashboard</h1>
        </PageSection>
        <PageSection>
        </PageSection>
        <PageSection variant={PageSectionVariants.light}>
          <CreateAnalysisSection/>
        </PageSection>
      </Wrapper>
    );
  }
}


export { DashboardPage as Dashboard };
