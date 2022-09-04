import { User } from "src/user/types/user-redux-state";
import { SET_USER } from "./const";

export const setUserInfoReducer: (state: User | null | undefined, action: any) => User | null = (
  state = null,
  action: { type: string; payload: any }
) => {
  switch (action.type) {
  case SET_USER:
    return action.payload.newUserInfo;

  default:
    return state ? state : null;
  }
};
