import { Navigate, Outlet } from "react-router-dom";
import Constant from "../lib/Constant";

// 1. ProtectedRoute: Login વગર dashboard કે leads ની access ના મળે
export function ProtectedRoute() {
  const isLogin = localStorage.getItem(Constant.LOGIN_KEY) === "true";

  if (!isLogin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// 2. PublicRoute: Login હોવા છતાં પાછા Login page પર ના જઈ શકાય
export function PublicRoute() {
  const isLogin = localStorage.getItem(Constant.LOGIN_KEY) === "true";

  if (isLogin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
