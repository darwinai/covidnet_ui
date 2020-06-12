import * as React from "react";
import { PageSection, PageSectionVariants } from "@patternfly/react-core";

import Wrapper from "../../containers/Layout/PageWrapper";
import PatientLookup from "../../components/PatientLookup";
import CreateAnalysisWrapper from "../../components/CreateAnalysis/CreateAnalysisWrapper";

const CreateAnalysisPage = () => {

  return (
    <div className="encapsulation">
      <Wrapper>
        <PageSection className="PatientLookupWrapper" variant={PageSectionVariants.light}>
          <PatientLookup isOnDashboard={false}></PatientLookup>
        </PageSection>
        <PageSection className="pfPageSectionGrey">
          <CreateAnalysisWrapper></CreateAnalysisWrapper>
        </PageSection>
      </Wrapper>
    </div>
  )

}

export default CreateAnalysisPage;