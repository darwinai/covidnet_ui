import React, { useEffect, useState } from "react";
import ChrisAPIClient from "./api/chrisapiclient";
import { AppContext } from "./context/context";
import { Types } from "./context/actions/types";
import { IUserState } from "./context/reducers/userReducer";
import Client, { User } from "@fnndsc/chrisapi";
import { useLocation, useHistory } from 'react-router-dom'

/**
 * Allows user to bypass Login page if already authenticated by checking AUTH_TOKEN
 * in session storage
 */
const RouterWrapper: React.FC = ({ children }) => {
  const { dispatch } = React.useContext(AppContext);
  const [renderChildren, setRenderChildren] = useState(false);
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    const token = window.sessionStorage.getItem("AUTH_TOKEN");
    (async () => {
      if (!!token) {
        const client: Client = ChrisAPIClient.getClient();
        const res: User = await client.getUser();
        const user: IUserState = res?.data;
        dispatch({
          type: Types.LOGIN_UPDATE,
          payload: user
        });
        
        // If on Login page and already authenticated, go to Create Analysis page
        if (location.pathname === "/login") {
          history.push('/');
        }
      }
      setRenderChildren(true);
    })(); 
  }, [dispatch]);

  return (renderChildren ? <>{children}</> : null);
}

export default RouterWrapper;
