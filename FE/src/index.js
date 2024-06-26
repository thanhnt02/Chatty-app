import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Router } from "react-router-dom";
import { MutilProvider } from "./Context";
import history from "../src/utils/history";

import { createStore } from "redux";
import allReducers from "./reducers";
import { Provider } from "react-redux";

const store = createStore(allReducers);

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <MutilProvider>
        <App />
      </MutilProvider>
    </Router>
  </Provider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
