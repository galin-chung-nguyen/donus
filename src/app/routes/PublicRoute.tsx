import { Route, Redirect } from "react-router-dom";
import { isLogin } from "../utils/isLogin";
const PublicRoute = ({ component: Component, restricted, ...rest }: any) => {
  const checkLogin = isLogin();

  return (
    // restricted = false meaning public route
    // restricted = true meaning restricted route
    <Route
      {...rest}
      render={(props) =>
        checkLogin && restricted ? <>{window.location.assign("/")}</> : <Component {...props} />
      }
    />
  );
};

export default PublicRoute;
