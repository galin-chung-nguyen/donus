import { createStore } from "redux";
import { defaultReduxState } from "src/app/types/reduxState";
import rootReducer from "./reducer";

const reduxStore = () => {
  return createStore(rootReducer, defaultReduxState);
};

export default reduxStore;
