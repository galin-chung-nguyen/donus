import { roomListSlice, mainChatSlice } from "@/chat-room/redux/reducer";
import userInfoSlice from "@/user/redux/reducer";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    [roomListSlice.name]: roomListSlice.reducer,
    [mainChatSlice.name]: mainChatSlice.reducer,
    [userInfoSlice.name]: userInfoSlice.reducer
  },
  devTools: true
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
