import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import CustomerDashboard from "../pages/Users/Customer/CustomerDashboard";
import DriverDashboard from "../pages/Users/Driver/DriverDashboard";
import ManagerDashboard from "../pages/Users/Managers/ManagerDashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import Restaurant from "../pages/Users/Managers/Resaturant";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute role="restaurant_manager">
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/restaurant"
            element={
              <ProtectedRoute role="restaurant_manager">
                <Restaurant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/restaurant/:id"
            element={
              <ProtectedRoute role="restaurant_manager">
                <Restaurant />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute role="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/driver/dashboard"
            element={
              <ProtectedRoute role="driver">
                <DriverDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default AppRouter;
