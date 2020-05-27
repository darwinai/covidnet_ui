
import React from "react";
import {
  Route,
  Switch,
} from "react-router-dom";

// Add view routes here
import { AnalysisDashboard } from "./pages/Analysis/Analaysis";
import {NotFound} from "./pages/NotFound/NotFound";

const Routes: React.FunctionComponent = () => (
    <React.Fragment>
      <Switch>
        <Route exact path="/" component={AnalysisDashboard} />
        <Route component={NotFound} />
      </Switch>
    </React.Fragment>
);




export default Routes;
