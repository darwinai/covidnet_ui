import { PageSection, PageSectionVariants, Spinner } from "@patternfly/react-core";
import React, { useState, useEffect } from "react";
import CreateAnalysisWrapper from "../../components/CreateAnalysis/CreateAnalysisWrapper";
import PatientLookup from "../../components/PatientLookup";
import Wrapper from "../../containers/Layout/PageWrapper";
import { DicomImagesTypes } from "../../context/actions/types";
import { AppContext } from "../../context/context";
import { initialIDcmImagesState } from "../../context/reducers/dicomImagesReducer";
import Error from "../../shared/error";

const CreateAnalysisPage = () => {
  const { state: { dcmImages, createAnalysis: { patientID } }, dispatch } = React.useContext(AppContext);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect( () => {
    // Clean up function for when user leaves the CreateAnalysis page
    return () => {
      dispatch({
        type: DicomImagesTypes.Update_all_images,
        payload: {
          images: initialIDcmImagesState
        }
      });
    }
  }, []);
  
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
