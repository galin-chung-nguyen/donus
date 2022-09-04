import { SET_USER } from "./const";

export const setUserInfoAction = (newUserInfo: any = null) => {
  return {
    type: SET_USER,
    payload: {
      newUserInfo: newUserInfo
    }
  };
};
