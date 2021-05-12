import { PageSection, PageSectionVariants } from "@patternfly/react-core";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import PastAnalysisTable from "../../components/pastAnalysis/PastAnalysisTable";
import Wrapper from "../../containers/Layout/PageWrapper";

type AllProps = RouteComponentProps;

const DashboardPage: React.FC<AllProps> = () => {

  return (
    <Wrapper>
      <PageSection className="page-body">
        {/* <PageSection className="section-area" variant={PageSectionVariants.light}>
        </PageSection> */}
        <PageSection className="flex-column" variant={PageSectionVariants.light}>
          <PastAnalysisTable></PastAnalysisTable>
        </PageSection>
      </PageSection>
    </Wrapper>
  );
}

export { DashboardPage as Dashboard };
