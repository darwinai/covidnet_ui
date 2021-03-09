import React, { useContext } from "react";
import { Redirect, Route } from "react-router-dom";
import { AppContext } from "./context/context";

interface PrivateRouteProps {
  component: React.FC<any>;
  path: string;
  exact: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = (props: PrivateRouteProps) => {
  const { state: { user: isLoggedIn } } = useContext(AppContext);

  return (isLoggedIn ? (<Route {...props} />) : (<Redirect to="/login" />));
}

export default PrivateRoute
