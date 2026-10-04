import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft, FiCheckCircle, FiMail } from "react-icons/fi";

import { api } from "../lib/api";
import useDocumentTitle from "../hooks/useDocumentTitle";
import AuthLayout from "../components/AuthLayout";
import { Spinner } from "../components/Spinner";

export default function ForgotPassword() {
  useDocumentTitle("Reset password");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentMessage, setSentMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // emails are stored lower-cased by the backend on signup
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return toast.error("Please enter your email address.");

    setLoading(true);

    try {
      const data = await api.forgotPassword(trimmed);
      setSentMessage(data.message || "Password reset request submitted.");
      toast.success("Request submitted");
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(error.message || "Something went wrong.");
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

  if (sentMessage) {
    return (
      <AuthLayout title="Check your inbox" footer={backLink}>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <FiCheckCircle className="mx-auto text-emerald-600" size={40} />
          <p className="mt-3 font-semibold text-emerald-900">{sentMessage}</p>
          <p className="mt-1 text-sm text-emerald-700">
            Requested for <span className="font-bold">{email.trim().toLowerCase()}</span>
          </p>
        </div>
        <p className="mt-4 text-center text-sm text-slate-500">
          The link is valid for 30 minutes. Can&apos;t see the email? Check
          your spam folder.
        </p>
        <button
          type="button"
          className="btn btn-secondary mt-5 w-full"
          onClick={() => {
            setSentMessage("");
            setEmail("");
          }}
        >
          Use a different email
        </button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter the email linked to your account and we'll send reset instructions."
      footer={backLink}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="label">Email address</label>
          <div className="relative">
            <FiMail className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
            <input
              id="email"
              type="email"
              required
              disabled={loading}
              autoComplete="email"
              placeholder="you@example.com"
              className="input pl-11"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
          {loading ? (
            <>
              <Spinner size={18} /> Sending...
            </>
          ) : (
            "Send reset link"
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
