import { useSelector } from "react-redux";
import { User } from "@/user/types/user-redux-state";
import { RootState } from "@/app/redux/reduxStore";

export function isLogin(): boolean {
  const user: User | null = useSelector<RootState, User | null>((state) => state.userInfo.value);
  return user ? true : false;
}
