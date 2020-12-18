import { createBrowserHistory } from "history";
import React from "react";
import ReactDOM from "react-dom";
import "./assets/scss/main.scss";
import "./lib/fontawesome-config";
import Main from "./main";
import * as serviceWorker from "./serviceWorker";

const history = createBrowserHistory();
ReactDOM.render(
    <Main history={history} />,  
    document.getElementById("root")
);

serviceWorker.unregister();
