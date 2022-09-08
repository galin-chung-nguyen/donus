import { MainChat, RoomList } from "src/chat-room/types/chat-room-redux-state";
import { SET_ROOM_LIST, SET_MAIN_CHAT } from "./const";

export const setRoomsReducer: (
  state: RoomList | null | undefined,
  action: any
) => RoomList | null = (state = null, action: { type: string; payload: any }) => {
  switch (action.type) {
  case SET_ROOM_LIST:
    return action.payload.newRoomList;

  default:
    return state ? state : null;
  }
};

export const setMainChatReducer: (
  state: MainChat | null | undefined,
  action: any
) => MainChat | null = (state = null, action: { type: string; payload: any }) => {
  switch (action.type) {
  case SET_MAIN_CHAT:
    return action.payload.newMainChatInfo;

  default:
    return state ? state : null;
  }
};
