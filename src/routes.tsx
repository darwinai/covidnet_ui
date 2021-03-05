
import React from "react";
import {
  Route,
  Switch
} from "react-router-dom";
import CreateAnalysisPage from "./pages/CreateAnalysisPage/CreateAnalysisPage";
// Add view routes here
import { Dashboard } from "./pages/Dashboard/Dashboard";
import LogInPage from "./pages/LogIn/Login";
import { NotFound } from "./pages/NotFound/NotFound";
import ViewImagePage from "./pages/viewImage/ViewImagePage";
import PrivateRoute from "./PrivateRoute";

const Routes: React.FunctionComponent = () => (
  <React.Fragment>
    <Switch>
      <Route exact path="/login" component={LogInPage} />
      <PrivateRoute component={Dashboard} path="/" />
      <PrivateRoute component={CreateAnalysisPage} path="/createAnalysis" />
      <PrivateRoute component={ViewImagePage} path="/viewImage" />
      <Route component={NotFound} />
    </Switch>
  </React.Fragment>
);

export default Routes;
