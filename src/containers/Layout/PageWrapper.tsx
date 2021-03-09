import { Page } from "@patternfly/react-core";
import * as React from "react";
import Header from "./Header";
import "./layout.scss";
import NotificationDrawerWrapper from "./NotificationDrawerWrapper";

interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper = (props: WrapperProps) => {
  const [isDrawerExpanded, setIsDrawerOpen] = React.useState(false);
  const { children } = props;

  return (
    <Page
      header={<Header onNotificationBadgeClick={() => setIsDrawerOpen(!isDrawerExpanded)}/>}
      notificationDrawer={<NotificationDrawerWrapper onClose={() => setIsDrawerOpen(!isDrawerExpanded)}/>}
      isNotificationDrawerExpanded={isDrawerExpanded}
    >
      {children}
    </Page>
  );
}

export default Wrapper;
