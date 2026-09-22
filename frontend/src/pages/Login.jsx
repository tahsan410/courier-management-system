import {
  useContext,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import {
  AuthContext,
} from "../context/AuthContext";


export default function Login() {

  const [formData, setFormData] =
    useState({
      username: "",
      password: "",
    });


  const [loading, setLoading] =
    useState(false);


  const {
    login,
  } = useContext(AuthContext);


  const navigate =
    useNavigate();


  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  };


  // =====================================================
  // LOGIN
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    if (loading) {
      return;
    }


    const username =
      formData.username.trim();

    const password =
      formData.password;


    if (!username) {

      toast.error(
        "Please enter your username."
      );

      return;
    }


    if (!password) {

      toast.error(
        "Please enter your password."
      );

      return;
    }


    setLoading(true);


    try {

      const response =
        await fetch(
          "http://127.0.0.1:8000/login",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              username,
              password,
            }),
          }
        );


      let data = {};


      try {

        data =
          await response.json();

      } catch {

        data = {};

      }


      // =================================================
      // API ERROR
      // =================================================

      if (!response.ok) {

        let errorMessage =
          "Invalid username or password.";


        if (
          Array.isArray(
            data.detail
          )
        ) {

          errorMessage =
            data.detail
              .map(
                (item) =>
                  item.msg ||
                  "Invalid input"
              )
              .join(", ");

        } else if (
          typeof data.detail ===
          "string"
        ) {

          errorMessage =
            data.detail;

        } else if (
          typeof data.message ===
          "string"
        ) {

          errorMessage =
            data.message;
        }


        throw new Error(
          errorMessage
        );
      }


      // =================================================
      // CHECK TOKEN
      // =================================================

      if (
        !data.access_token
      ) {

        throw new Error(
          "Login response did not contain an access token."
        );
      }


      // =================================================
      // CHECK USER DATA
      // =================================================

      if (
        !data.username ||
        !data.role
      ) {

        throw new Error(
          "Login response contains incomplete user information."
        );
      }


      // =================================================
      // SAVE LOGIN
      // =================================================

      const loggedIn =
        login(
          {
            username:
              data.username,

            email:
              data.email || "",

            role:
              data.role,
          },

          data.access_token
        );


      if (!loggedIn) {

        throw new Error(
          "Could not save login session."
        );
      }


      // =================================================
      // SUCCESS
      // =================================================

      toast.success(
        "Logged in successfully!"
      );


      // Clear password from form
      setFormData({
        username,
        password: "",
      });


      // =================================================
      // REDIRECT
      // =================================================

      if (
        data.role === "admin"
      ) {

        navigate(
          "/admin",
          {
            replace: true,
          }
        );

      } else {

        navigate(
          "/my-parcels",
          {
            replace: true,
          }
        );

      }


    } catch (error) {

      console.error(
        "Login error:",
        error
      );


      // =================================================
      // NETWORK ERROR
      // =================================================

      if (
        error instanceof TypeError &&
        error.message ===
          "Failed to fetch"
      ) {

        toast.error(
          "Cannot connect to the backend. Make sure FastAPI is running on port 8000."
        );

      } else {

        toast.error(
          error.message ||
          "Login failed."
        );
      }


    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="min-h-[80vh] flex items-center justify-center bg-gray-100 p-4">

      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Login to Your Account
        </h2>


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
              autoComplete="username"
              disabled={loading}
              value={
                formData.username
              }
              onChange={
                handleChange
              }
              placeholder="Enter your username"
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
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
              autoComplete="current-password"
              disabled={loading}
              value={
                formData.password
              }
              onChange={
                handleChange
              }
              placeholder="Enter your password"
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
            />

          </div>


          {/* FORGOT PASSWORD */}

          <div className="text-right">

            <Link
              to="/forgot-password"
              className="text-xs text-indigo-600 hover:underline"
            >
              Forgot password?
            </Link>

          </div>


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition"
          >

            {loading
              ? "Logging in..."
              : "Login"}

          </button>

        </form>


        <p className="mt-4 text-center text-sm text-gray-600">

          Don't have an account?{" "}

          <Link
            to="/signup"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Sign up
          </Link>

        </p>

      </div>

    </div>
  );
}