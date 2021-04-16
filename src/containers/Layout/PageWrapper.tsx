import { Page } from "@patternfly/react-core";
import React from "react";
import Footer from "./Footer";
import Header from "./Header";
import "../../assets/scss/layout/layout.scss";
import NotificationDrawerWrapper from "./NotificationDrawerWrapper";

interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper: React.FC<WrapperProps> = ({children}) => {
  const [isDrawerExpanded, setIsDrawerOpen] = React.useState(false);

  return (
    <Page
      header={<Header onNotificationBadgeClick={() => setIsDrawerOpen(!isDrawerExpanded)} />}
      notificationDrawer={<NotificationDrawerWrapper onClose={() => setIsDrawerOpen(!isDrawerExpanded)} />}
      isNotificationDrawerExpanded={isDrawerExpanded}
      className="page-wrapper"
    >
      {children}
      <Footer></Footer>
    </Page>
  );
}

export default Wrapper;
