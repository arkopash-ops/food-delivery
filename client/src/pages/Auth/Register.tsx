import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "customer",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      if (data.success) {
        localStorage.setItem("isAuthenticated", "true");
        window.dispatchEvent(new Event("authChanged"));
        navigate("/");
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
              name="name"
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <input
              className="form-control"
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <input
              className="form-control"
              name="phone"
              type="text"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <input
              className="form-control"
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <select
              className="form-control"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="customer">Customer</option>
              <option value="restaurant_manager">Restaurant Manager</option>
              <option value="driver">Driver</option>
            </select>
          </div>

          <button className="btn btn-success w-100" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>

          <p className="mt-3 text-center">
            Already have an Account? <a href="/">Log in</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
