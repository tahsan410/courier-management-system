import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiAlertTriangle, FiArrowLeft, FiLock } from "react-icons/fi";

import { api } from "../lib/api";
import useDocumentTitle from "../hooks/useDocumentTitle";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";
import { Spinner } from "../components/Spinner";

export default function ResetPassword() {
  useDocumentTitle("Choose a new password");

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [linkError, setLinkError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (password.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords do not match");

    setLoading(true);

    try {
      await api.resetPassword(token, password);
      toast.success("Password updated! Please log in.");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Reset password error:", error);
      // 400 = bad / expired / already-used link
      if (error.status === 400 && /link/i.test(error.message)) {
        setLinkError(error.message);
      } else {
        toast.error(error.message || "Could not reset password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const backLink = (
    <Link
      to="/login"
      className="inline-flex items-center gap-2 font-semibold text-brand-600 hover:underline"
    >
      <FiArrowLeft /> Back to login
    </Link>
  );

  // missing token, or the server said the link is invalid/expired/used
  if (!token || linkError) {
    return (
      <AuthLayout title="Link not valid" footer={backLink}>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <FiAlertTriangle className="mx-auto text-amber-600" size={40} />
          <p className="mt-3 font-semibold text-amber-900">
            {linkError ||
              "This password reset link is missing or incomplete."}
          </p>
        </div>
        <Link to="/forgot-password" className="btn btn-primary btn-lg mt-5 w-full">
          Request a new link
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Enter a new password for your account."
      footer={backLink}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="password" className="label">New password</label>
          <PasswordInput
            id="password"
            required
            minLength={6}
            disabled={loading}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="label">Confirm new password</label>
          <PasswordInput
            id="confirm"
            required
            disabled={loading}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter your password"
          />
          {confirm && confirm !== password && (
            <p className="mt-1.5 text-xs font-medium text-rose-600">
              Passwords do not match
            </p>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
          {loading ? (
            <>
              <Spinner size={18} /> Updating...
            </>
          ) : (
            <>
              <FiLock /> Update password
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
