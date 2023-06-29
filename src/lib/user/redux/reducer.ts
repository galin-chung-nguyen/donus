// import { User } from "@/user/types/user-redux-state";
// import { SET_USER } from "./const";

// export const setUserInfoReducer: (state: User | null | undefined, action: any) => User | null = (
//   state = null,
//   action: { type: string; payload: any }
// ) => {
//   switch (action.type) {
//   case SET_USER:
//     return action.payload.newUserInfo;

//   default:
//     return state ? state : null;
//   }
// };

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/user/types/user-redux-state";
import { SET_USER } from "./const";

type SetUserInfoActionPayload = {
  newUserInfo: User;
};

export interface UserState {
  value: any;
}
const initialUserState: UserState = {
  value: null as User | null
};

const userInfoSlice = createSlice({
  name: "userInfo",
  initialState: initialUserState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<SetUserInfoActionPayload>) => {
      state.value = action.payload.newUserInfo;
    }
  }
});

export const { setUserInfo } = userInfoSlice.actions;

export default userInfoSlice;
