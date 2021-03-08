import { PageSection, PageSectionVariants } from "@patternfly/react-core";
import React, { useContext, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import { CreateAnalysisSection } from "../../components/CreateAnalysis/CreateAnalysis";
import PastAnalysisTable from "../../components/pastAnalysis/PastAnalysisTable";
import Wrapper from "../../containers/Layout/PageWrapper";
import { AnalysisTypes, CreateAnalysisTypes, NotificationActionTypes, StagingDcmImagesTypes } from "../../context/actions/types";
import { AppContext } from "../../context/context";
import CreateAnalysisService from "../../services/CreateAnalysisService";

type AllProps = RouteComponentProps;

const DashboardPage: React.FC<AllProps> = () => {
  const { state: { stagingDcmImages, models }, dispatch } = useContext(AppContext);

  useEffect(() => {
    document.title = "Analysis - CovidNet UI";
    if (stagingDcmImages.length <= 0) return;

    // Processing the images
    CreateAnalysisService.analyzeImages(stagingDcmImages, models.xrayModel, models.ctModel) // Passing selected models to Chris_Integration for image analysis
      .then((notifications) => {
        dispatch({
          type: StagingDcmImagesTypes.UpdateStaging,
          payload: { imgs: [] }
        })
        // Clearing the selecting images step in create analysis
        dispatch({
          type: CreateAnalysisTypes.Clear_selected_studies_UID
        })
        dispatch({
          type: AnalysisTypes.Update_are_new_imgs_available,
          payload: { isAvailable: true }
        })
        dispatch({
          type: NotificationActionTypes.SEND,
          payload: { notifications }
        })
      })
  }, [dispatch, stagingDcmImages, models.ctModel, models.xrayModel]);

  return (
    <Wrapper>
      <PageSection variant={PageSectionVariants.light}>
        <h1 className="board-title">Dashboard</h1>
      </PageSection>
      <PageSection>
        <PageSection className="section-area" variant={PageSectionVariants.light}>
          <CreateAnalysisSection />
        </PageSection>
        <PageSection variant={PageSectionVariants.light} className="footer-styling">
          <PastAnalysisTable></PastAnalysisTable>
        </PageSection>
      </PageSection>
    </Wrapper>
  );
}


export { DashboardPage as Dashboard };
