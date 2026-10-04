import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowRight, FiUser } from "react-icons/fi";

import { api } from "../lib/api";
import useAuth from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";
import { Spinner } from "../components/Spinner";

export default function Login() {
  useDocumentTitle("Login");

  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  // set once a login from this page succeeded, so the "already logged in"
  // redirect below doesn't race with our own (smarter) post-login navigation
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  // already logged in → go to the right place
  if (user && !justLoggedIn) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/my-parcels"} replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const username = formData.username.trim();
    const password = formData.password;

    if (!username) return toast.error("Please enter your username.");
    if (!password) return toast.error("Please enter your password.");

    setLoading(true);

    try {
      const data = await api.login({ username, password });

      if (!data.access_token) {
        throw new Error("Login response did not contain an access token.");
      }
      if (!data.username || !data.role) {
        throw new Error("Login response contains incomplete user information.");
      }

      const ok = login(
        { username: data.username, email: data.email || "", role: data.role },
        data.access_token
      );
      if (!ok) throw new Error("Could not save login session.");

      setJustLoggedIn(true);

      toast.success("Logged in successfully!");

      const from = location.state?.from;

      if (data.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        // never send a normal user to the admin area
        navigate(from && from !== "/admin" ? from : "/my-parcels", {
          replace: true,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to book, track and manage your parcels."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-bold text-brand-600 hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="username" className="label">
            Username
          </label>
          <div className="relative">
            <FiUser className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
            <input
              id="username"
              type="text"
              name="username"
              required
              autoComplete="username"
              disabled={loading}
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="input pl-11"
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-semibold text-slate-700">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            name="password"
            required
            autoComplete="current-password"
            disabled={loading}
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
          {loading ? (
            <>
              <Spinner size={18} /> Logging in...
            </>
          ) : (
            <>
              Login <FiArrowRight />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
