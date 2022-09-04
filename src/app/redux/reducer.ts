import { combineReducers } from "redux";
import { setMainChatReducer, setRoomsReducer } from "src/chat-room/redux/reducer";
import { setUserInfoReducer } from "src/user/redux/reducer";

const rootReducer = combineReducers({
  user: setUserInfoReducer,
  roomList: setRoomsReducer,
  mainChat: setMainChatReducer
});

export default rootReducer;
