import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

const Navbar = () => {
  const navigate = useNavigate();

  const readAuthStatus = () =>
    localStorage.getItem("isAuthenticated") === "true" ||
    Boolean(localStorage.getItem("token"));
  const readRole = () => localStorage.getItem("role") || "";

  const [isAuthenticated, setIsAuthenticated] =
    useState<boolean>(readAuthStatus());
  const [role, setRole] = useState<string>(readRole());

  useEffect(() => {
    const updateAuth = () => {
      setIsAuthenticated(readAuthStatus());
      setRole(readRole());
    };

    window.addEventListener("authChanged", updateAuth);
    return () => window.removeEventListener("authChanged", updateAuth);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(`Logout failed: ${data.message || "Unknown error"}`);
        return;
      }

      // Clear flag and notify Navbar
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.dispatchEvent(new Event("authChanged"));

      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  return (
    <nav className="navbar bg-dark navbar-expand-lg" data-bs-theme="dark">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          Navbar
        </a>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            {isAuthenticated && (
              <ProtectedRoute>
                <>
                  {role === "restaurant_manager" && (
                    <>
                      <li className="nav-item">
                        <a
                          className="nav-link"
                          onClick={() => navigate("/manager/dashboard")}
                        >
                          Dashboard
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          className="nav-link"
                          onClick={() => navigate("/manager/menu-item")}
                        >
                          Add MenuItem
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          className="nav-link"
                          onClick={() => navigate("/manager/categories")}
                        >
                          Add category
                        </a>
                      </li>
                    </>
                  )}

                  {role === "customer" && (
                    <>
                      <li className="nav-item">
                        <a
                          className="nav-link"
                          onClick={() => navigate("/customer/home")}
                        >
                          Home
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          className="nav-link"
                          onClick={() => navigate("/customer/address")}
                        >
                          Address
                        </a>
                      </li>
                    </>
                  )}

                  {role === "driver" && (
                    <li className="nav-item">
                      <a
                        className="nav-link"
                        onClick={() => navigate("/driver/dashboard")}
                      >
                        Dashboard
                      </a>
                    </li>
                  )}
                </>
              </ProtectedRoute>
            )}

            {!isAuthenticated && (
              <>
                <li className="nav-item">
                  <a className="nav-link" onClick={() => navigate("/")}>
                    Login
                  </a>
                </li>

                <li className="nav-item">
                  <a className="nav-link" href="/register">
                    Register
                  </a>
                </li>
              </>
            )}
          </ul>

          {isAuthenticated && (
            <div className="ms-auto">
              <button className="btn btn-outline-danger" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
