import { Page } from "@patternfly/react-core";
import * as React from "react";
import Footer from "./Footer";
import Header from "./Header";
import "../../assets/scss/layout/layout.scss";
import NotificationDrawerWrapper from "./NotificationDrawerWrapper";
import { AppContext } from "../../context/context";
import { NotificationActionTypes } from "../../context/actions/types";

interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper = (props: WrapperProps) => {
  const { state: { stagingDcmImages, models }, dispatch } = React.useContext(AppContext);
  const [isDrawerExpanded, setIsDrawerOpen] = React.useState(false);
  const { children } = props;

  return (
    <Page
      header={<Header onNotificationBadgeClick={() => {
        if (isDrawerExpanded) {
          console.log("ARRIVED")
          dispatch({
            type: NotificationActionTypes.SEND,
            payload: { notifications: [] }
          });
        }
        setIsDrawerOpen(!isDrawerExpanded);
      }} />}
      notificationDrawer={<NotificationDrawerWrapper onClose={() => {
        setIsDrawerOpen(!isDrawerExpanded);
        if (isDrawerExpanded) {
          console.log("ARRIVED")
          dispatch({
            type: NotificationActionTypes.SEND,
            payload: { notifications: [] }
          });
      }}} />}
      isNotificationDrawerExpanded={isDrawerExpanded}
      className="footer-styling"
    >
      {children}
      <Footer></Footer>
    </Page>
  );
}

export default Wrapper;
