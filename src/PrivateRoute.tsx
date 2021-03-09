import React, { useContext } from "react";
import { Redirect, Route } from "react-router-dom";
import { AppContext } from "./context/context";

interface PrivateRouteProps {
  component: React.FC<any>;
  path: string;
  exact: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({component, path, exact}) => {
  const isLoggedIn = useContext(AppContext).state.user.loggedIn;

  return (isLoggedIn ? (<Route component={component} path={path} exact={exact} />) : (<Redirect to="/login" />));
}

export default PrivateRoute
