import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await api.post("/auth/login/", formData);
      login(response.data.access);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.detail || "Invalid credentials");
    }
  };

  return (
    <div className="container auth-wrap">
      <div className="card card-soft">
        <div className="card-body p-4">
          <h3 className="auth-title">Welcome back</h3>
          <p className="muted-note">Login to track and manage your complaints.</p>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input className="form-control" name="username" onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                className="form-control"
                name="password"
                type="password"
                onChange={handleChange}
                required
              />
            </div>
            <button className="btn btn-primary w-100" type="submit">
              Login
            </button>
          </form>
          <p className="mt-3 mb-0">
            New user? <Link to="/signup">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
