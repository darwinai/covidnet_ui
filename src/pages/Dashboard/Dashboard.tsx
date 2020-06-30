import React, { useEffect, useContext } from "react";
import { RouteComponentProps } from "react-router-dom";
import Wrapper from "../../containers/Layout/PageWrapper";
import { PageSection, PageSectionVariants } from "@patternfly/react-core";
import { CreateAnalysisSection } from "../../components/CreateAnalysis/CreateAnalysis";
import { AppContext } from "../../context/context";
import CreateAnalysisService from "../../services/CreateAnalysisService";
import { StagingDcmImagesTypes, CreateAnalysisTypes, AnalysisTypes } from "../../context/actions/types";
import PastAnalysisTable from "../../components/pastAnalysis/PastAnalysisTable";

type AllProps = RouteComponentProps;

const DashboardPage: React.FC<AllProps> = () => {
  const { state: { stagingDcmImages }, dispatch } = useContext(AppContext);

  useEffect(() => {
    document.title = "Anayalsis - CovidNet ui";
    if (stagingDcmImages.length <= 0) return;

    // process the images
    CreateAnalysisService.analyzeImages(stagingDcmImages)
      .then(() => {
        dispatch({
          type: StagingDcmImagesTypes.UpdateStaging,
          payload: { imgs: [] }
        })
        dispatch({
          type: CreateAnalysisTypes.Clear_selected_studies_UID
        })
        dispatch({
          type: AnalysisTypes.Update_are_new_imgs_available,
          payload: { isAvailable: true }
        })
      })
  }, [dispatch, stagingDcmImages])

  return (
    <Wrapper>
      <PageSection variant={PageSectionVariants.light}>
        <h1 className='board-title'>Dashboard</h1>
      </PageSection>
      <PageSection>
        <PageSection className='sectionArea' variant={PageSectionVariants.light}>
          <CreateAnalysisSection />
        </PageSection>
        <PageSection variant={PageSectionVariants.light}>
          <PastAnalysisTable></PastAnalysisTable>
          {/* <PastAnalysis></PastAnalysis> */}
        </PageSection>
      </PageSection>
    </Wrapper>
  );
}


export { DashboardPage as Dashboard };
