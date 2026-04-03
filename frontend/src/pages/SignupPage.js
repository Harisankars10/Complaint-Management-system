import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

// Reusable input icons (inline SVG, no extra package needed)
function UserIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function MailIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function LockIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 11V7a5 5 0 0 0-10 0v4" />
      <rect x="5" y="11" width="14" height="10" rx="2" />
    </svg>
  );
}

function EyeIcon({ shown, className }) {
  if (shown) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3l18 18" />
      <path d="M10.58 10.58a3 3 0 0 0 4.24 4.24" />
      <path d="M9.88 5.08A10.43 10.43 0 0 1 12 5c7 0 11 7 11 7a21.8 21.8 0 0 1-5.15 6.03" />
      <path d="M6.11 6.11C2.84 8.36 1 12 1 12s4 7 11 7c1.12 0 2.16-.19 3.12-.51" />
    </svg>
  );
}

function validateForm(values) {
  const errors = {};

  if (!values.username.trim()) errors.username = "Username is required.";
  else if (values.username.trim().length < 3) errors.username = "Username must be at least 3 characters.";

  if (!values.email.trim()) errors.email = "Email is required.";
  else if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = "Enter a valid email address.";

  if (!values.password) errors.password = "Password is required.";
  else if (values.password.length < 6) errors.password = "Password must be at least 6 characters.";

  if (!["user", "admin"].includes(values.role)) errors.role = "Please choose a valid role.";

  return errors;
}

function mapApiErrorsToFields(data) {
  const fieldErrors = {};
  let globalError = "";

  if (typeof data === "object" && data) {
    // Standardized API error format: { success: false, message: "..." }
    if (typeof data.message === "string" && Object.keys(data).length <= 2) {
      return { fieldErrors, globalError: data.message };
    }

    Object.entries(data).forEach(([key, value]) => {
      if (key === "success") return;
      const message = Array.isArray(value) ? value.join(", ") : String(value);
      if (["username", "email", "password", "role"].includes(key)) {
        fieldErrors[key] = message;
      } else {
        globalError = globalError ? `${globalError} | ${key}: ${message}` : `${key}: ${message}`;
      }
    });
  } else if (typeof data === "string") {
    globalError = data;
  }

  return { fieldErrors, globalError };
}

function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const updated = { ...formData, [e.target.name]: e.target.value };
    setFormData(updated);
    // Live validation per field for better UX
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: validateForm(updated)[e.target.name] || "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const clientErrors = validateForm(formData);
    setFieldErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await api.post("/auth/register/", formData);
      setSuccess("Registration successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      const data = err?.response?.data;
      const status = err?.response?.status;
      const statusText = err?.response?.statusText;

      if (data) {
        const parsed = mapApiErrorsToFields(data);
        setFieldErrors((prev) => ({ ...prev, ...parsed.fieldErrors }));
        setError(parsed.globalError || "Please correct the highlighted fields.");
      } else if (status) {
        setError(`Request failed (${status}${statusText ? ` ${statusText}` : ""}).`);
      } else if (err?.code === "ERR_NETWORK") {
        setError("Cannot reach backend API. Start Django server and try again.");
      } else {
        setError(err?.message || "Registration failed. Please check your inputs.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-skySoft-50 to-skySoft-100 dark:from-slate-900 dark:to-slate-800 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-skySoft-800 dark:text-slate-100">Create your account</h1>
          <p className="text-skySoft-800/70 dark:text-slate-400 mt-1 text-sm md:text-base">
            Sign up and start submitting complaints in minutes.
          </p>
        </div>

        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-2xl shadow-lg border border-skySoft-200 dark:border-slate-600">
          <div className="p-5 md:p-7">
            {error && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-xl bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-skySoft-900 dark:text-slate-300 mb-2">Username</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-skySoft-600 dark:text-slate-400" />
                  <input
                    className="w-full rounded-xl border border-skySoft-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-10 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Choose a username"
                  />
                </div>
                {fieldErrors.username && <p className="mt-1 text-sm text-red-600">{fieldErrors.username}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-skySoft-900 dark:text-slate-300 mb-2">Email</label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-skySoft-600 dark:text-slate-400" />
                  <input
                    className="w-full rounded-xl border border-skySoft-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-10 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                </div>
                {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-skySoft-900 dark:text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-skySoft-600 dark:text-slate-400" />
                  <input
                    className="w-full rounded-xl border border-skySoft-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-10 pr-12 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                  />
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
                {fieldErrors.password && <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-skySoft-900 dark:text-slate-300 mb-2">Role</label>
                <select
                  className="w-full rounded-xl border border-skySoft-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option className="bg-slate-700 text-slate-100 hover:bg-blue-500" value="user">Student/User</option>
                  <option className="bg-slate-700 text-slate-100 hover:bg-blue-500" value="admin">Admin</option>
                </select>
                {fieldErrors.role && <p className="mt-1 text-sm text-red-600">{fieldErrors.role}</p>}
              </div>

              <button
                className="w-full rounded-xl py-3 font-semibold text-white bg-slate-900 hover:bg-slate-800 transition transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:transform-none shadow-md"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-5 space-y-3">
              <p className="text-center text-sm text-skySoft-800/70 dark:text-slate-400">Already have an account?</p>
              <Link
                to="/login"
                className="block w-full text-center rounded-xl py-3 font-semibold border border-slate-700 text-white bg-slate-700 hover:bg-slate-600 transition shadow-sm"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
