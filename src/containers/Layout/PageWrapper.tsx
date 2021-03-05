import { Page } from "@patternfly/react-core";
import * as React from "react";
import { Types } from "../../context/actions/types";
import { AppContext } from "../../context/context";
import Header from "./Header";
import "./layout.scss";
import NotificationDrawerWrapper from "./NotificationDrawerWrapper";

interface WrapperProps {
  children: React.ReactNode
}

const Wrapper = (props: WrapperProps) => {
  
  const { dispatch } = React.useContext(AppContext);

  const [isDrawerExpanded, setIsDrawerOpen] = React.useState(false);

  React.useEffect(()=>{
    const token = window.sessionStorage.getItem('AUTH_TOKEN')
    if (!!token) {
      dispatch({
        type: Types.Login_update,
        payload: {
          username: 'chris',
        }
      });
    }
  },[dispatch])

  const { children } = props

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
