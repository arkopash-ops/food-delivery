import { Navigate } from "react-router-dom";

export interface Props {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const token = localStorage.getItem("token");
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  if (!token && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
