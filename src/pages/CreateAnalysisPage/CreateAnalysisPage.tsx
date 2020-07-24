import * as React from "react";
import { PageSection, PageSectionVariants } from "@patternfly/react-core";

import Wrapper from "../../containers/Layout/PageWrapper";
import PatientLookup from "../../components/PatientLookup";
import CreateAnalysisWrapper from "../../components/CreateAnalysis/CreateAnalysisWrapper";
import { AppContext } from "../../context/context";
import Error from "../../shared/error";

const CreateAnalysisPage = () => {
  const { state } = React.useContext(AppContext);
  const { dcmImages } = state;

  return (
    <div className="encapsulation">
      <Wrapper>
        <PageSection className="PatientLookupWrapper" variant={PageSectionVariants.light}>
          <PatientLookup isOnDashboard={false}></PatientLookup>
        </PageSection>
        {
          dcmImages.length > 0 ?
            <PageSection className="pfPageSectionGrey">
              <CreateAnalysisWrapper></CreateAnalysisWrapper>
            </PageSection>
            :
            <PageSection variant={PageSectionVariants.light}>
              <Error>No studies found</Error>
            </PageSection>
        }
      </Wrapper>
    </div>
  )
}

export default CreateAnalysisPage;