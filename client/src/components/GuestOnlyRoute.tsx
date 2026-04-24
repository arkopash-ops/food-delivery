import { Navigate, Outlet } from "react-router-dom";

const GuestOnlyRoute = () => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const role = localStorage.getItem("role");

  if (isAuthenticated) {
    if (role === "customer") {
      return <Navigate to="/customer/home" replace />;
    }

    if (role === "restaurant_manager") {
      return <Navigate to="/manager/dashboard" replace />;
    }

    if (role === "driver") {
      return <Navigate to="/driver/dashboard" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default GuestOnlyRoute;
