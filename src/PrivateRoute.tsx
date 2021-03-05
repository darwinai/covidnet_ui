import React, { useContext } from 'react'
import { Redirect, Route } from 'react-router-dom'
import { AppContext } from './context/context'

interface PrivateRouteProps {
  component: React.FC<any>;
  path: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = (props: PrivateRouteProps) => {
  const isLoggedIn = useContext(AppContext).state.user.loggedIn;

  return (isLoggedIn ? (<Route {...props} exact={true} />) : (<Redirect  to="/login"  />));
}

export default PrivateRoute
