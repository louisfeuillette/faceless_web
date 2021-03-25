import React from "react";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { Provider } from "react-redux";
import { createStore, combineReducers } from "redux";

import tokenUser from "./reducers/user.reducer";

import Registration from "./components/Registration";
import Quizz from "./components/Quizz";
import OptionalQuizz from "./components/OptionalQuizz";
import Home from "./components/Home";
import SignIn from "./components/SignIn";
import Profil from "./components/Profil";
import Message from "./components/Message";

const store = createStore(combineReducers({ tokenUser }));

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <Switch>
          <Route exact path="/">
            <Registration />
          </Route>
          <Route exact path="/Quizz">
            <Quizz />
          </Route>
          <Route exact path="/OptionalQuizz">
            <OptionalQuizz />
          </Route>
          <Route exact path="/Home">
            <Home />
          </Route>
          <Route exact path="/SignIn">
            <SignIn />
          </Route>
          <Route exact path="/Profil">
            <Profil />
          </Route>
          <Route exact path="/Message">
            <Message />
          </Route>
        </Switch>
      </Router>
    </Provider>
  );
}
