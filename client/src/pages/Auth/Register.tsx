import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Error: ${data.message || "Registration failed"}`);
        return;
      }

      if (data.success) {
        localStorage.setItem("isAuthenticated", "true");
        window.dispatchEvent(new Event("authChanged"));
        navigate("/user/dashboard");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Something went wrong. Please try again later.");
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
        <h3 className="text-center mb-3">Register</h3>

        <form onSubmit={handleRegister}>
            <div className="mb-3">
            <input
              className="form-control"
              type="text"
              placeholder="Name"
              value={email}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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

          <button className="btn btn-success w-100" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
