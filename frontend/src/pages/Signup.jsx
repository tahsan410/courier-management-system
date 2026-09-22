import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import toast from "react-hot-toast";

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // HANDLE SIGNUP
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    // Validation
    if (!formData.username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://courier-management-system-fiss.onrender.com/signup",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            username: formData.username.trim(),

            email: formData.email.trim().toLowerCase(),

            password: formData.password,

            role: formData.role,
          }),
        }
      );

      // Try to read response
      let data;

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      // Backend error
      if (!response.ok) {
        let errorMessage = "Signup failed";

        if (Array.isArray(data.detail)) {
          errorMessage = data.detail
            .map((item) => item.msg || "Invalid input")
            .join(", ");
        } else if (data.detail) {
          errorMessage = data.detail;
        }

        throw new Error(errorMessage);
      }

      // Success
      toast.success("Account created successfully!");

      // Clear form
      setFormData({
        username: "",
        email: "",
        password: "",
        role: "user",
      });

      // Go to login
      setTimeout(() => {
        navigate("/login");
      }, 500);

    } catch (error) {
      console.error("Signup error:", error);

      if (
        error instanceof TypeError &&
        error.message === "Failed to fetch"
      ) {
        toast.error(
          "Cannot connect to server. Please make sure FastAPI is running."
        );
      } else {
        toast.error(
          error.message || "Signup failed"
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-100 p-4">

      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">

        {/* TITLE */}

        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">
          Create an Account
        </h2>

        <p className="text-sm text-gray-500 text-center mb-6">
          Register for your courier management account
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* USERNAME */}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>

            <input
              type="text"
              name="username"
              required
              disabled={loading}
              autoComplete="username"
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
            />
          </div>


          {/* EMAIL */}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              required
              disabled={loading}
              autoComplete="email"
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>


          {/* PASSWORD */}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              name="password"
              required
              minLength={6}
              disabled={loading}
              autoComplete="new-password"
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
            />

            <p className="text-xs text-gray-500 mt-1">
              Password must contain at least 6 characters.
            </p>
          </div>


          {/* ROLE */}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Account Type
            </label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
            >

              <option value="user">
                User (Customer)
              </option>

              <option value="admin">
                Admin / Delivery Manager
              </option>

            </select>

            {/* ROLE DESCRIPTION */}

            {formData.role === "user" ? (
              <p className="text-xs text-gray-500 mt-1">
                Customer account for booking and tracking parcels.
              </p>
            ) : (
              <p className="text-xs text-red-500 mt-1">
                Admin / Delivery Manager can manage all parcels.
              </p>
            )}

          </div>


          {/* SIGNUP BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition"
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>

        </form>


        {/* LOGIN LINK */}

        <p className="mt-5 text-center text-sm text-gray-600">

          Already have an account?{" "}

          <Link
            to="/login"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Login here
          </Link>

        </p>

      </div>

    </div>
  );
}