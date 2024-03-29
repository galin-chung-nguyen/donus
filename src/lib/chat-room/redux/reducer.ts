import { MainChat, RoomList } from "@/chat-room/types/chat-room-redux-state";
import { SET_ROOM_LIST, SET_MAIN_CHAT } from "./const";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// export const setRoomsReducer: (
//   state: RoomList | null | undefined,
//   action: any
// ) => RoomList | null = (state = null, action: { type: string; payload: any }) => {
//   switch (action.type) {
//     case SET_ROOM_LIST:
//       return action.payload.newRoomList;

//     default:
//       return state ? state : null;
//   }
// };

// export const setMainChatReducer: (
//   state: MainChat | null | undefined,
//   action: any
// ) => MainChat | null = (state = null, action: { type: string; payload: any }) => {
//   switch (action.type) {
//     case SET_MAIN_CHAT:
//       return action.payload.newMainChatInfo;

//     default:
//       return state ? state : null;
//   }
// };

type SetRoomsActionPayload = {
  newRoomList: RoomList;
};

type SetMainChatActionPayload = {
  newMainChatInfo: MainChat;
};

const initialRoomListState: RoomList = { value: null };
const initialMainChatState: MainChat = { value: null };

export const roomListSlice = createSlice({
  name: "roomList",
  initialState: initialRoomListState,
  reducers: {
    setRoomList: (state, action: PayloadAction<SetRoomsActionPayload>) => {
      state.value = action.payload.newRoomList;
    }
  }
});

export const mainChatSlice = createSlice({
  name: "mainChat",
  initialState: initialMainChatState,
  reducers: {
    setMainChat: (state, action: PayloadAction<SetMainChatActionPayload>) => {
      state.value = action.payload.newMainChatInfo;
    }
  }
});

export const { setRoomList } = roomListSlice.actions;
export const { setMainChat } = mainChatSlice.actions;
