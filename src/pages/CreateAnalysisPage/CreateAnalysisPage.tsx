import * as React from "react";
import { PageSection, PageSectionVariants } from "@patternfly/react-core";

import Wrapper from "../../containers/Layout/PageWrapper";
import PatientLookup from "../../components/PatientLookup";

const CreateAnalysisPage = () => {

  return (
    <Wrapper>
      <PageSection variant={PageSectionVariants.light}>
        <PatientLookup isOnDashboard={false}></PatientLookup>
      </PageSection>
    </Wrapper>
  )

}

export default CreateAnalysisPage;