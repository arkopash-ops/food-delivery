import { Navigate } from "react-router-dom";

export interface Props {
  children: React.ReactNode;
  role?: string;
}

const ProtectedRoute = ({ children, role }: Props) => {
  const token = localStorage.getItem("token");
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const userRole = localStorage.getItem("role");

  //for logged in
  if (!token && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // for role
  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
