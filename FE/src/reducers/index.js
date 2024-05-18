import fetchAgainReducer from "./fetchAgain";
import { combineReducers } from "redux";

const allReducers = combineReducers({
  fetchAgainReducer,
  // Thêm các reducer phía dưới này
});

export default allReducers;
