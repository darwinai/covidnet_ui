import { PageSection, PageSectionVariants, Alert, Button } from "@patternfly/react-core";
import React from "react";
import { RouteComponentProps, useHistory } from "react-router-dom";
import ArrowRightIcon from '@patternfly/react-icons/dist/js/icons/arrow-right-icon';
import PastAnalysisTable from "../../components/pastAnalysis/PastAnalysisTable";
import Wrapper from "../../containers/Layout/PageWrapper";

type AllProps = RouteComponentProps;

const DashboardPage: React.FC<AllProps> = () => {

  const history = useHistory();

  return (
    <Wrapper>
      <PageSection className="page-body">
        <PageSection className="section-area" variant={PageSectionVariants.light}>
          <Alert isInline variant="warning" title="Patient lookup designated to Create Analysis page">
            <p>To look up a patient and create a new analysis, please go to the Create Analysis page.</p>
          </Alert>
          <Button variant="link" isLarge className="pf-u-pl-0" 
          onClick={() => history.push('/createAnalysis')}> 
          Create Analysis <ArrowRightIcon/>
          </Button>
        </PageSection>
        <PageSection className="flex-column" variant={PageSectionVariants.light}>
          <PastAnalysisTable></PastAnalysisTable>
        </PageSection>
      </PageSection>
    </Wrapper>
  );
}

export { DashboardPage as Dashboard };
