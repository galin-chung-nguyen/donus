import { SET_ROOM_LIST, SET_MAIN_CHAT } from "./const";

export const setRoomListAction = (newRoomList = {}) => {
  return {
    type: SET_ROOM_LIST,
    payload: {
      newRoomList: newRoomList
    }
  };
};

export const setMainChatInfoAction = (newMainChatInfo = {}) => {
  return {
    type: SET_MAIN_CHAT,
    payload: {
      newMainChatInfo: newMainChatInfo
    }
  };
};
