import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function formatApiErrors(data) {
  if (!data) return "Registration failed. Please check your inputs.";
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    const parts = [];
    Object.entries(data).forEach(([field, messages]) => {
      if (Array.isArray(messages)) {
        parts.push(`${field}: ${messages.join(", ")}`);
      } else if (typeof messages === "string") {
        parts.push(`${field}: ${messages}`);
      }
    });
    if (parts.length) return parts.join(" | ");
  }
  return "Registration failed. Please check your inputs.";
}

function formatRequestError(err) {
  const status = err?.response?.status;
  const statusText = err?.response?.statusText;
  const data = err?.response?.data;

  if (data) return formatApiErrors(data);

  if (status) {
    return `Request failed (${status}${statusText ? ` ${statusText}` : ""}).`;
  }

  if (err?.code === "ERR_NETWORK") {
    return "Cannot reach backend API. Start Django server and make sure REACT_APP_API_BASE_URL is correct.";
  }

  return err?.message || "Registration failed. Please check your inputs.";
}

function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/auth/register/", formData);
      setSuccess("Registration successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setError(formatRequestError(err));
    }
  };

  return (
    <div className="container auth-wrap">
      <div className="card card-soft">
        <div className="card-body p-4">
          <h3 className="auth-title">Create your account</h3>
          <p className="muted-note">Sign up and start submitting complaints in minutes.</p>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input className="form-control" name="username" onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" name="email" type="email" onChange={handleChange} required />
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
            <div className="mb-3">
              <label className="form-label">Role</label>
              <select className="form-select" name="role" onChange={handleChange} value={formData.role}>
                <option value="user">Student/User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button className="btn btn-success w-100" type="submit">
              Create Account
            </button>
          </form>
          <p className="mt-3 mb-0">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
