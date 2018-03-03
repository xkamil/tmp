import React from 'react';
import ReactDOM from 'react-dom';
import App from './containers/App';
import {applyMiddleware, createStore} from "redux";
import reducers from "./reducers";
import {Provider} from "react-redux";
import thunk from "redux-thunk";
import Api from "./Api";
import "./index.css";

const store = createStore(reducers , applyMiddleware(thunk.withExtraArgument(Api)));

ReactDOM.render(<Provider store={store}><App/></Provider>, document.getElementById('root'));
