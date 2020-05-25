
import React from "react";
import {
  Route,
  Switch,
} from "react-router-dom";

// Add view routes here
import { Dashboard } from "./pages/Dashboard/Dashboard";
import {NotFound} from "./pages/NotFound/NotFound";

const Routes: React.FunctionComponent = () => (
    <React.Fragment>
      <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route component={NotFound} />
      </Switch>
    </React.Fragment>
);




export default Routes;
