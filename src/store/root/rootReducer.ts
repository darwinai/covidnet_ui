
import { combineReducers } from "redux";

/// ADD ALL Local Reducers:
// import { ComponentReducer } from '../file-source';
import { uiReducer } from "../ui/reducer";
import { connectRouter } from "connected-react-router";
import { History } from "history";

export default (history: History) =>
  combineReducers({
    router: connectRouter(history),
    ui: uiReducer,
    // rest of your reducers ...
  });
