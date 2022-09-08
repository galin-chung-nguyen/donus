import { Route, Redirect } from "react-router-dom";
import { isLogin } from "../utils/isLogin";

const PrivateRoute = ({ component: Component, restricted, ...rest }: any) => {
  const checkLogin = isLogin();

  return (
    // restricted = false meaning public route
    // restricted = true meaning restricted route
    <Route
      {...rest}
      render={(props) =>
        checkLogin ? <Component {...props} /> : <>{window.location.assign("/sign-in")}</>
      }
    />
  );
};

export default PrivateRoute;
