
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

const Routes: React.FunctionComponent = () => (
    <React.Fragment>
      <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route exact path="/login" component={LogInPage} />
        <Route exact path="/createAnalysis" component={CreateAnalysisPage} />
        <Route exact path="/viewImage" component={ViewImagePage} />
        <Route component={NotFound} />
      </Switch>
    </React.Fragment>
);




export default Routes;
