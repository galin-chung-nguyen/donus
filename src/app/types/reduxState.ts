import { MainChat, RoomList } from "src/chat-room/types/chat-room-redux-state";
import { User } from "src/user/types/user-redux-state";

export interface ReduxState {
  user: User | null;
  roomList: RoomList | null;
  mainChat: MainChat | null;
}

export const defaultReduxState: ReduxState = {
  user: null,
  roomList: null,
  mainChat: null
};
