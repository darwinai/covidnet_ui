import { PageSection, PageSectionVariants } from "@patternfly/react-core";
import * as React from "react";
import CreateAnalysisWrapper from "../../components/CreateAnalysis/CreateAnalysisWrapper";
import PatientLookup from "../../components/PatientLookup";
import Wrapper from "../../containers/Layout/PageWrapper";
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
          dcmImages.filteredDcmImages.length > 0 ?
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