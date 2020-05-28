import React from "react";
import ReactDOM from "react-dom";
import { createBrowserHistory } from "history";
import "./lib/fontawesome-config";
import Main from "./main";
import * as serviceWorker from "./serviceWorker";
import "./assets/scss/main.scss";

const history = createBrowserHistory();
ReactDOM.render(
    <Main history={history} />,  
    document.getElementById("root")
);

serviceWorker.unregister();
