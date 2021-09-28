import { applyMiddleware, createStore } from "redux";
import rootReducer from './reducer';

let reduxStore = (defaultState = {
    user: null,
    roomList : {},
    mainChat : {}
}) => {
    return createStore(rootReducer, defaultState);
}

export default reduxStore;