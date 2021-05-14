import { PageSection, PageSectionVariants } from "@patternfly/react-core";
import React, { useState } from "react";
import CreateAnalysisWrapper from "../../components/CreateAnalysis/CreateAnalysisWrapper";
import PatientLookup from "../../components/PatientLookup";
import Wrapper from "../../containers/Layout/PageWrapper";
import { AppContext } from "../../context/context";
import Error from "../../shared/error";

const CreateAnalysisPage = () => {
  const { state: { dcmImages, createAnalysis: { patientID } } } = React.useContext(AppContext);
  const [hasSearched, setHasSearched] = useState(patientID && patientID !== "");

  return (
    <Wrapper>
      <PageSection className="page-body">
        <PageSection className="section-area" variant={PageSectionVariants.light}>
          <PatientLookup setHasSearched={setHasSearched}></PatientLookup>
        </PageSection>
          {
            dcmImages.allDcmImages.length > 0 ?
              <PageSection variant={PageSectionVariants.light}>
                <CreateAnalysisWrapper></CreateAnalysisWrapper>
              </PageSection>
              :
              <PageSection className="page-section-no-results" variant={PageSectionVariants.light}>
                <Error>{ hasSearched ? "No studies found for MRN #" + patientID : "Search for a patient by entering their MRN above" } </Error>
              </PageSection>
          }
        </PageSection>
    </Wrapper>
  )
}

export default CreateAnalysisPage;
