import { Page } from "@patternfly/react-core";
import * as React from "react";
import { Types } from "../../context/actions/types";
import { AppContext } from "../../context/context";
import Header from "./Header";
import "./layout.scss";
import NotificationDrawerWrapper from "./NotificationDrawerWrapper";
import ChrisAPIClient from "../../api/chrisapiclient";
import { IUserState, UserResponse } from "../../context/reducers/userReducer";

interface WrapperProps {
  children: React.ReactNode
}

const Wrapper = (props: WrapperProps) => {
  
  const { dispatch } = React.useContext(AppContext);
  const [isDrawerExpanded, setIsDrawerOpen] = React.useState(false);

  React.useEffect(()=>{
    const token = window.sessionStorage.getItem('AUTH_TOKEN');
    if (!!token) {
      const client: any = ChrisAPIClient.getClient();
      client.getUser().then((res: UserResponse) => {
        const user: IUserState = res?.data;
        dispatch({
          type: Types.Login_update,
          payload: user,
        });
      })
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
