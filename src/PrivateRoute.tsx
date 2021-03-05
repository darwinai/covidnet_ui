// This is used to determine if a user is authenticated and
// if they are allowed to visit the page they navigated to.

// If they are: they proceed to the page
// If not: they are redirected to the login page.
import React, { useContext } from 'react'
import { Redirect, Route } from 'react-router-dom'
import { AppContext } from './context/context'

const PrivateRoute = (component: any, path: string) => {

  // Add your own authentication on the below line.
  const isLoggedIn = useContext(AppContext).state.user.loggedIn;

  return  isLoggedIn ? (<Route  path={path}  exact={true} component={component} />) : 
  (<Redirect  to="/login"  />);
}

export default PrivateRoute