import React, { useEffect, useState } from "react";
import ChrisAPIClient from "./api/chrisapiclient";
import { AppContext } from "./context/context";
import { Types } from "./context/actions/types";
import { IUserState } from "./context/reducers/userReducer";
import Client, { User } from "@fnndsc/chrisapi";

const RouterWrapper: React.FC = ({ children }) => {
  const { dispatch } = React.useContext(AppContext);
  const [renderChildren, setRenderChildren] = useState(false);

  useEffect(() => {
    const token = window.sessionStorage.getItem("AUTH_TOKEN");
    (async () => {
      if (!!token) {
        const client: Client = ChrisAPIClient.getClient();
        const res: User = await client.getUser();
        const user: IUserState = res?.data;
        dispatch({
          type: Types.Login_update,
          payload: user
        });          
      }
      setRenderChildren(true);
    })(); 
  }, [dispatch]);

  return (renderChildren ? <>{children}</> : null);
}

export default RouterWrapper;
