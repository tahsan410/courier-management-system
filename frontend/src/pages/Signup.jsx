import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowRight, FiMail, FiShield, FiUser, FiUsers } from "react-icons/fi";

import { api } from "../lib/api";
import useAuth from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";
import { Spinner } from "../components/Spinner";

const ROLES = [
  {
    value: "user",
    title: "Customer",
    text: "Book and track your parcels",
    icon: FiUsers,
  },
  {
    value: "admin",
    title: "Admin / Manager",
    text: "Manage all parcels & statuses",
    icon: FiShield,
  },
];

function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
}

const STRENGTH = [
  { label: "Too short", color: "bg-slate-200", text: "text-slate-400" },
  { label: "Weak", color: "bg-rose-500", text: "text-rose-600" },
  { label: "Fair", color: "bg-amber-500", text: "text-amber-600" },
  { label: "Good", color: "bg-sky-500", text: "text-sky-600" },
  { label: "Strong", color: "bg-emerald-500", text: "text-emerald-600" },
];

export default function Signup() {
  useDocumentTitle("Create account");

  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
    role: "user",
    admin_code: "",
  });
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => passwordStrength(formData.password), [formData.password]);

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/my-parcels"} replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!formData.username.trim()) return toast.error("Please enter a username");
    if (!formData.email.trim()) return toast.error("Please enter your email");
    if (formData.password.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (formData.password !== formData.confirm)
      return toast.error("Passwords do not match");
    if (formData.role === "admin" && !formData.admin_code.trim())
      return toast.error("Please enter the admin secret code");

    setLoading(true);

    try {
      await api.signup({
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        ...(formData.role === "admin" && {
          admin_code: formData.admin_code,
        }),
      });

      toast.success("Account created successfully! Please log in.");
      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const s = STRENGTH[strength];

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join CourierExpress and start shipping in minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-brand-600 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ACCOUNT TYPE */}
        <div>
          <span className="label">Account type</span>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map(({ value, title, text, icon: Icon }) => {
              const active = formData.role === value;
              return (
                <button
                  key={value}
                  type="button"
                  disabled={loading}
                  onClick={() => setFormData((p) => ({ ...p, role: value }))}
                  className={`rounded-xl border-2 p-3 text-left transition ${
                    active
                      ? "border-brand-600 bg-brand-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                  aria-pressed={active}
                >
                  <Icon className={active ? "text-brand-600" : "text-slate-400"} size={20} />
                  <p className="mt-2 text-sm font-bold text-slate-900">{title}</p>
                  <p className="text-xs text-slate-500">{text}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ADMIN SECRET CODE */}
        {formData.role === "admin" && (
          <div className="animate-fade-in">
            <label htmlFor="admin_code" className="label">
              Admin secret code
            </label>
            <PasswordInput
              id="admin_code"
              name="admin_code"
              required
              disabled={loading}
              value={formData.admin_code}
              onChange={handleChange}
              placeholder="Enter the admin secret code"
            />
            <p className="hint">Only authorised staff have this code.</p>
          </div>
        )}

        {/* USERNAME */}
        <div>
          <label htmlFor="username" className="label">Username</label>
          <div className="relative">
            <FiUser className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
            <input
              id="username"
              type="text"
              name="username"
              required
              disabled={loading}
              autoComplete="username"
              className="input pl-11"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
            />
          </div>
        </div>

        {/* EMAIL */}
        <div>
          <label htmlFor="email" className="label">Email address</label>
          <div className="relative">
            <FiMail className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
            <input
              id="email"
              type="email"
              name="email"
              required
              disabled={loading}
              autoComplete="email"
              className="input pl-11"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div>
          <label htmlFor="password" className="label">Password</label>
          <PasswordInput
            id="password"
            name="password"
            required
            minLength={6}
            disabled={loading}
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
          />
          <div className="mt-2 flex items-center gap-3">
            <div className="flex flex-1 gap-1">
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    formData.password && i <= strength ? s.color : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className={`w-14 text-right text-xs font-semibold ${formData.password ? s.text : "text-slate-400"}`}>
              {formData.password ? s.label : ""}
            </span>
          </div>
        </div>

        {/* CONFIRM */}
        <div>
          <label htmlFor="confirm" className="label">Confirm password</label>
          <PasswordInput
            id="confirm"
            name="confirm"
            required
            disabled={loading}
            autoComplete="new-password"
            value={formData.confirm}
            onChange={handleChange}
            placeholder="Re-enter your password"
          />
          {formData.confirm && formData.confirm !== formData.password && (
            <p className="mt-1.5 text-xs font-medium text-rose-600">
              Passwords do not match
            </p>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
          {loading ? (
            <>
              <Spinner size={18} /> Creating account...
            </>
          ) : (
            <>
              Create account <FiArrowRight />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
