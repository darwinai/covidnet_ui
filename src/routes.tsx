
import React from "react";
import {
  Route,
  Switch
} from "react-router-dom";
import CreateAnalysisPage from "./pages/CreateAnalysisPage/CreateAnalysisPage";
// Add view routes here
import { PastPredictions } from "./pages/PastPredictions/PastPredictions";
import LogInPage from "./pages/LogIn/Login";
import { NotFound } from "./pages/NotFound/NotFound";
import ViewImagePage from "./pages/viewImage/ViewImagePage";
import PrivateRoute from "./PrivateRoute";

const Routes: React.FunctionComponent = () => (
  <React.Fragment>
    <Switch>
      <Route exact path="/login" component={LogInPage} />
      <PrivateRoute exact component={CreateAnalysisPage} path="/" />
      <PrivateRoute exact component={PastPredictions} path="/pastPredictions" />
      <PrivateRoute exact component={ViewImagePage} path="/viewImage" />
      <Route component={NotFound} />
    </Switch>
  </React.Fragment>
);

export default Routes;
