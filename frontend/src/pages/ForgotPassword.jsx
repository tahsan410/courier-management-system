import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";


export default function ForgotPassword() {

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e) => {

    e.preventDefault();


    const trimmedEmail =
      email.trim();


    if (!trimmedEmail) {
      toast.error(
        "Please enter your email address."
      );
      return;
    }


    if (loading) return;


    setLoading(true);


    try {

      const res = await fetch(
        "http://127.0.0.1:8000/forgot-password",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: trimmedEmail,
          }),
        }
      );


      let data;

      try {
        data = await res.json();
      } catch {
        data = {};
      }


      if (!res.ok) {
        throw new Error(
          data.detail ||
          "Password reset request failed."
        );
      }


      toast.success(
        data.message ||
        "Password reset request submitted."
      );


      setEmail("");


    } catch (error) {

      console.error(
        "Forgot password error:",
        error
      );


      if (
        error instanceof TypeError &&
        error.message === "Failed to fetch"
      ) {
        toast.error(
          "Cannot connect to the backend server."
        );
      } else {
        toast.error(
          error.message ||
          "Something went wrong."
        );
      }


    } finally {

      setLoading(false);

    }
  };


  return (

    <div className="min-h-[80vh] flex items-center justify-center bg-gray-100 p-4">

      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">

        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">
          Reset Password
        </h2>


        <p className="text-sm text-gray-600 mb-6 text-center">
          Enter your email address to request password reset instructions.
        </p>


        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <div>

            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>


            <input
              type="email"
              required
              disabled={loading}
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {loading
              ? "Sending..."
              : "Send Reset Link"}
          </button>

        </form>


        <p className="mt-4 text-center text-sm text-gray-600">

          Remembered password?{" "}

          <Link
            to="/login"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Back to Login
          </Link>

        </p>

      </div>

    </div>
  );
}