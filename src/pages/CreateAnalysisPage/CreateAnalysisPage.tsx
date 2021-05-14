import { PageSection, PageSectionVariants, Spinner } from "@patternfly/react-core";
import React, { useState } from "react";
import CreateAnalysisWrapper from "../../components/CreateAnalysis/CreateAnalysisWrapper";
import PatientLookup from "../../components/PatientLookup";
import Wrapper from "../../containers/Layout/PageWrapper";
import { AppContext } from "../../context/context";
import Error from "../../shared/error";

const CreateAnalysisPage = () => {
  const { state: { dcmImages, createAnalysis: { patientID } } } = React.useContext(AppContext);
  const [hasSearched, setHasSearched] = useState(patientID && patientID !== "");
  const [isSearching, setIsSearching] = useState(false);
  let pageSectionContent;

  if(isSearching){
    pageSectionContent = (
      <div className="loading">
        <Spinner size="xl" /> &nbsp; Searching
      </div>
    );
  } else if(dcmImages.allDcmImages.length > 0) {
    pageSectionContent = (
      <CreateAnalysisWrapper></CreateAnalysisWrapper>
    );
  }else {
    pageSectionContent = (
    <Error>{ hasSearched ? "No studies found for MRN #" + patientID : "Search for a patient by entering their MRN above" } </Error>
  );
  }

  return (
    <Wrapper>
      <PageSection className="page-body">
        <PageSection className="section-area" variant={PageSectionVariants.light}>
          <PatientLookup setHasSearched={setHasSearched} setIsSearching={setIsSearching}></PatientLookup>
        </PageSection>
          <PageSection variant={PageSectionVariants.light}>
            {pageSectionContent}
            </PageSection>
        </PageSection>
    </Wrapper>
  )
}

export default CreateAnalysisPage;
