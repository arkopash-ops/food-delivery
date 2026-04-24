import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/Layout";

import ProtectedRoute from "../components/ProtectedRoute";
import GuestOnlyRoute from "../components/GuestOnlyRoute";

import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";

import CustomerHome from "../pages/Users/Customer/CustomerHome";
import Address from "../pages/Users/Customer/Address";
import Orders from "../pages/Users/Customer/Orders";

import ManagerDashboard from "../pages/Users/Manager/ManagerDashboard";
import Restaurant from "../pages/Users/Manager/Resaturant";
import Category from "../pages/Users/Manager/Category";
import MenuItem from "../pages/Users/Manager/MenuItem";
import Order from "../pages/Users/Manager/Order";

import DriverDashboard from "../pages/Users/Driver/DriverDashboard";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route element={<GuestOnlyRoute />}>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

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
          <Route
            path="/manager/orders"
            element={
              <ProtectedRoute role="restaurant_manager">
                <Order />
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
            path="/customer/orders"
            element={
              <ProtectedRoute role="customer">
                <Orders />
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
