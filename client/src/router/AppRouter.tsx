import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import CustomerHome from "../pages/Users/Customer/CustomerHome";
import Address from "../pages/Users/Customer/Address";
import DriverDashboard from "../pages/Users/Driver/DriverDashboard";
import ManagerDashboard from "../pages/Users/Managers/ManagerDashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import Restaurant from "../pages/Users/Managers/Resaturant";
import Category from "../pages/Users/Managers/Category";
import MenuItem from "../pages/Users/Managers/MenuItem";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* restaurant_manager */}
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
            path="/manager/menu-item"
            element={
              <ProtectedRoute role="restaurant_manager">
                <MenuItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/categories"
            element={
              <ProtectedRoute role="restaurant_manager">
                <Category />
              </ProtectedRoute>
            }
          />

          {/* customer */}
          <Route
            path="/customer/home"
            element={
              <ProtectedRoute role="customer">
                <CustomerHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/address"
            element={
              <ProtectedRoute role="customer">
                <Address />
              </ProtectedRoute>
            }
          />

          {/* driver */}
          <Route
            path="/driver/dashboard"
            element={
              <ProtectedRoute role="driver">
                <DriverDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default AppRouter;
