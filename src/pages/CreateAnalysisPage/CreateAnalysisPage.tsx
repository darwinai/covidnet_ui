import { PageSection, PageSectionVariants } from "@patternfly/react-core";
import * as React from "react";
import CreateAnalysisWrapper from "../../components/CreateAnalysis/CreateAnalysisWrapper";
import PatientLookup from "../../components/PatientLookup";
import Wrapper from "../../containers/Layout/PageWrapper";
import { AppContext } from "../../context/context";
import Error from "../../shared/error";

const CreateAnalysisPage = () => {
  const { state: { dcmImages } } = React.useContext(AppContext);

  return (
    <div className="encapsulation">
      <Wrapper>
        <PageSection className="PatientLookupWrapper" variant={PageSectionVariants.light}>
          <PatientLookup isOnDashboard={false}></PatientLookup>
        </PageSection>
        {
          dcmImages.allDcmImages.length > 0 ?
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