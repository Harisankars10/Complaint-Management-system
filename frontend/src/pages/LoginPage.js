import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// Inline SVG icons so you don't need extra icon libraries
function MailIcon({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function LockIcon({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 11V7a5 5 0 0 0-10 0v4" />
      <rect x="5" y="11" width="14" height="10" rx="2" />
    </svg>
  );
}

function EyeIcon({ shown, className }) {
  if (shown) {
    return (
      <svg
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l18 18" />
      <path d="M10.58 10.58a3 3 0 0 0 4.24 4.24" />
      <path d="M9.88 5.08A10.43 10.43 0 0 1 12 5c7 0 11 7 11 7a21.8 21.8 0 0 1-5.15 6.03" />
      <path d="M6.11 6.11C2.84 8.36 1 12 1 12s4 7 11 7c1.12 0 2.16-.19 3.12-.51" />
    </svg>
  );
}

function LoginPage() {
  // Backend expects { username, password }
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await api.post("/auth/login/", formData);
      const accessToken = response?.data?.data?.access || response?.data?.access;
      if (!accessToken) {
        throw new Error(response?.data?.message || "Login failed. Access token not received.");
      }
      login(accessToken);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.detail || err?.message || "Invalid credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-skySoft-50 to-skySoft-100 dark:from-slate-900 dark:to-slate-800 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-skySoft-800 dark:text-slate-100">Welcome back</h1>
          <p className="text-skySoft-800/70 dark:text-slate-400 mt-1 text-sm md:text-base">
            Login to track and manage your complaints.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-2xl shadow-lg border border-skySoft-200 dark:border-slate-600">
          <div className="p-5 md:p-7">
            {/* Error message */}
            {error && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-skySoft-900 dark:text-slate-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-skySoft-600 dark:text-slate-400" />
                  <input
                    className="w-full rounded-xl border border-skySoft-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-10 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                    name="username"
                    onChange={handleChange}
                    value={formData.username}
                    placeholder="Enter your username"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-skySoft-900 dark:text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-skySoft-600 dark:text-slate-400" />
                  <input
                    className="w-full rounded-xl border border-skySoft-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-10 pr-12 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    onChange={handleChange}
                    value={formData.password}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />

                  {/* Show/Hide toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg text-skySoft-700 dark:text-slate-300 hover:text-skySoft-900 dark:hover:text-white hover:bg-skySoft-100 dark:hover:bg-slate-600 transition"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    <EyeIcon shown={showPassword} className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                disabled={isSubmitting}
                className="w-full rounded-xl py-3 font-semibold text-white bg-slate-900 hover:bg-slate-800 transition transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:transform-none shadow-md"
                type="submit"
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="mt-5 space-y-3">
              <p className="text-center text-sm text-skySoft-800/70 dark:text-slate-400">New user?</p>
              <Link
                to="/signup"
                className="block w-full text-center rounded-xl py-3 font-semibold border border-slate-700 text-white bg-slate-700 hover:bg-slate-600 transition shadow-sm"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
