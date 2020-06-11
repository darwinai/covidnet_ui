
import React from "react";
import {
  Route,
  Switch,
} from "react-router-dom";

// Add view routes here
import { Dashboard } from "./pages/Dashboard/Dashboard";
import {NotFound} from "./pages/NotFound/NotFound";
import LogInPage from "./pages/LogIn/Login";
import CreateAnalysisPage from "./pages/CreateAnalysisPage/CreateAnalysisPage"

const Routes: React.FunctionComponent = () => (
    <React.Fragment>
      <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route exact path="/login" component={LogInPage} />
        <Route exact path="/createAnalysis" component={CreateAnalysisPage} />
        <Route component={NotFound} />
      </Switch>
    </React.Fragment>
);




export default Routes;
