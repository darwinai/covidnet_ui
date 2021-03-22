import { PageSection, PageSectionVariants } from "@patternfly/react-core";
import React, { useContext, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import { CreateAnalysisSection } from "../../components/CreateAnalysis/CreateAnalysis";
import PastAnalysisTable from "../../components/pastAnalysis/PastAnalysisTable";
import Wrapper from "../../containers/Layout/PageWrapper";
import { AnalysisTypes, NotificationActionTypes, StagingDcmImagesTypes } from "../../context/actions/types";
import { AppContext } from "../../context/context";
import CreateAnalysisService from "../../services/CreateAnalysisService";

type AllProps = RouteComponentProps;

const DashboardPage: React.FC<AllProps> = () => {
  const { state: { stagingDcmImages, models }, dispatch } = useContext(AppContext);

  useEffect(() => {
    document.title = "Analysis - COVID-Net UI";
    if (stagingDcmImages.length <= 0) return;
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
        <PageSection variant={PageSectionVariants.light}>
          <PastAnalysisTable></PastAnalysisTable>
        </PageSection>
      </PageSection>
    </Wrapper>
  );
}


export { DashboardPage as Dashboard };
