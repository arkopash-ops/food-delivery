import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      if (data.success) {
        localStorage.setItem("isAuthenticated", "true");
        window.dispatchEvent(new Event("authChanged"));
        navigate("/user/dashboard");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center mt-5">
      <div
        className="card shadow p-4"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <h3 className="text-center mb-3">Login</h3>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input
              className="form-control"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <input
              className="form-control"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Logging..." : "Login"}
          </button>

          <p className="mt-3 text-center">Don't have an Account? <a href="/register">Register</a></p>
        </form>
      </div>
    </div>
  );
};

export default Login;
