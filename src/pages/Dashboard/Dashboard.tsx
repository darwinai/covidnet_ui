import { PageSection, PageSectionVariants } from "@patternfly/react-core";
import React, { useContext, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import { CreateAnalysisSection } from "../../components/CreateAnalysis/CreateAnalysis";
import PastAnalysisTable from "../../components/pastAnalysis/PastAnalysisTable";
import Wrapper from "../../containers/Layout/PageWrapper";
import { AnalysisTypes, NotificationActionTypes, StagingDcmImagesTypes } from "../../context/actions/types";
import { AppContext } from "../../context/context";
import { NotificationItem } from "../../context/reducers/notificationReducer";
import CreateAnalysisService from "../../services/CreateAnalysisService";

type AllProps = RouteComponentProps;

const DashboardPage: React.FC<AllProps> = () => {

  // const useAsync = (asyncFn: any, onSuccess: any) => {
  //   useEffect(() => {
  //     let isMounted = true;
  //     asyncFn(stagingDcmImages, models.xrayModel, models.ctModel).then((data: NotificationItem[]) => {
  //       if (isMounted) onSuccess(data);
  //     });
  //     return () => {
  //       isMounted = false;
  //     };
  //   }, [asyncFn, onSuccess]);
  // }

  const { state: { stagingDcmImages, models }, dispatch } = useContext(AppContext);

  useEffect(() => {
    document.title = "Analysis - COVID-Net UI";
    if (stagingDcmImages.length <= 0) return;

    // Processing the images
    // CreateAnalysisService.analyzeImages(stagingDcmImages, models.xrayModel, models.ctModel) // Passing selected models to Chris_Integration for image analysis
    //   .then((notifications) => {
    //     dispatch({
    //       type: StagingDcmImagesTypes.UpdateStaging,
    //       payload: { imgs: [] }
    //     })
    //     dispatch({
    //       type: AnalysisTypes.Update_are_new_imgs_available,
    //       payload: { isAvailable: true }
    //     });
    //     dispatch({
    //       type: NotificationActionTypes.SEND,
    //       payload: { notifications }
    //     })
    //   });

    // useAsync(CreateAnalysisService.analyzeImages, (notifications: NotificationItem[]) => {
    //   dispatch({
    //     type: StagingDcmImagesTypes.UpdateStaging,
    //     payload: { imgs: [] }
    //   })
    //   dispatch({
    //     type: AnalysisTypes.Update_are_new_imgs_available,
    //     payload: { isAvailable: true }
    //   });
    //   dispatch({
    //     type: NotificationActionTypes.SEND,
    //     payload: { notifications }
    //   })
    // })

    const updateImages = (notifications: NotificationItem[]) => {
      dispatch({
        type: StagingDcmImagesTypes.UpdateStaging,
        payload: { imgs: [] }
      })
      dispatch({
        type: AnalysisTypes.Update_are_new_imgs_available,
        payload: { isAvailable: true }
      });
      dispatch({
        type: NotificationActionTypes.SEND,
        payload: { notifications }
      })
    }

    let isMounted = true;
    CreateAnalysisService.analyzeImages(stagingDcmImages, models.xrayModel, models.ctModel).then((data: NotificationItem[]) => {
        if (isMounted) updateImages(data);
      });
      return () => {
        isMounted = false;
      };

      
  }, [dispatch, stagingDcmImages]);

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
