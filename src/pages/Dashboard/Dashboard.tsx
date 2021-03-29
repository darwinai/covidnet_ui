import { PageSection, PageSectionVariants } from "@patternfly/react-core";
import React, { useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import { CreateAnalysisSection } from "../../components/CreateAnalysis/CreateAnalysis";
import PastAnalysisTable from "../../components/pastAnalysis/PastAnalysisTable";
import Wrapper from "../../containers/Layout/PageWrapper";

type AllProps = RouteComponentProps;

const DashboardPage: React.FC<AllProps> = () => {

  useEffect(()=> {
    document.title = "Analysis - COVID-Net UI";
  }, []);
  

  return (
    <Wrapper>
      <PageSection className="page-body">
        <PageSection className="section-area" variant={PageSectionVariants.light}>
          <CreateAnalysisSection />
        </PageSection>
        <PageSection className="flex-column" variant={PageSectionVariants.light}>
          <PastAnalysisTable></PastAnalysisTable>
        </PageSection>
      </PageSection>
    </Wrapper>
  );
}


export { DashboardPage as Dashboard };
