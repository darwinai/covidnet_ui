import * as React from "react";
import { PageSection, PageSectionVariants } from "@patternfly/react-core";

import Wrapper from "../../containers/Layout/PageWrapper";
import PatientLookup from "../../components/PatientLookup";
import CreateAnalysisWrapper from "../../components/CreateAnalysis/CreateAnalysisWrapper";
import { AppContext } from "../../context/context";

const CreateAnalysisPage = () => {
  const { state } = React.useContext(AppContext);
  const { dcmImages } = state;
  return (
    <div className="encapsulation">
      <Wrapper>
        <PageSection className="PatientLookupWrapper" variant={PageSectionVariants.light}>
          <PatientLookup isOnDashboard={false}></PatientLookup>
        </PageSection>
        <PageSection className="pfPageSectionGrey">
          {
            dcmImages.length > 0 ? (<CreateAnalysisWrapper></CreateAnalysisWrapper>): <p>No images found</p>
          }
        </PageSection>
      </Wrapper>
    </div>
  )

}

export default CreateAnalysisPage;