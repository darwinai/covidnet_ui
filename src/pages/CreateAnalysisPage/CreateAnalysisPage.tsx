import { PageSection, PageSectionVariants } from "@patternfly/react-core";
import React from "react";
import CreateAnalysisWrapper from "../../components/CreateAnalysis/CreateAnalysisWrapper";
import PatientLookup from "../../components/PatientLookup";
import Wrapper from "../../containers/Layout/PageWrapper";
import { AppContext } from "../../context/context";
import Error from "../../shared/error";

const CreateAnalysisPage = () => {
  const { state: { dcmImages } } = React.useContext(AppContext);

  return (
    <Wrapper>
      <PageSection className="page-body">
        <PageSection className="section-area" variant={PageSectionVariants.light}>
          <PatientLookup></PatientLookup>
        </PageSection>
          {
            dcmImages.allDcmImages.length > 0 ?
              <PageSection variant={PageSectionVariants.light}>
                <CreateAnalysisWrapper></CreateAnalysisWrapper>
              </PageSection>
              :
              <PageSection className="page-section-no-results" variant={PageSectionVariants.light}>
                <Error>No studies found</Error>
              </PageSection>
          }
        </PageSection>
    </Wrapper>
  )
}

export default CreateAnalysisPage;
