import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import Login from "../pages/Auth/login";
import Register from "../pages/Auth/Register";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Login />}></Route>
          <Route path="/register" element={<Register />}></Route>
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default AppRouter;
