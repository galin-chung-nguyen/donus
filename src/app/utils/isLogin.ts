import { useSelector } from "react-redux";
import { User } from "src/user/types/user-redux-state";
import { ReduxState } from "../types/reduxState";

export function isLogin(): boolean {
  const user: User | null = useSelector<ReduxState, User | null>((state) => state.user);
  return user ? true : false;
}
