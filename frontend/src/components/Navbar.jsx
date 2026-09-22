import { useContext } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

import toast from "react-hot-toast";


export default function Navbar() {
  const {
    user,
    loading,
    logout,
  } = useContext(AuthContext);

  const navigate = useNavigate();


  const handleLogout = () => {
    logout();

    toast.success(
      "Logged out successfully!"
    );

    navigate("/login");
  };


  return (
    <nav className="bg-slate-900 text-white shadow-md">

      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-3">

        {/* BRAND */}

        <Link
          to="/"
          className="text-xl font-bold text-indigo-400 hover:text-indigo-300"
        >
          📦 CourierExpress
        </Link>


        {/* NAVIGATION */}

        <div className="flex flex-wrap gap-4 items-center">

          <Link
            to="/"
            className="hover:text-indigo-300 transition"
          >
            Home
          </Link>


          <Link
            to="/track"
            className="hover:text-indigo-300 transition"
          >
            Track Parcel
          </Link>


          {/* AUTH LOADING */}

          {loading ? (

            <span className="text-sm text-gray-400">
              Loading...
            </span>

          ) : user ? (

            <>

              {/* ADMIN */}

              {user.role === "admin" ? (

                <Link
                  to="/admin"
                  className="hover:text-indigo-300 font-semibold text-yellow-400"
                >
                  Admin Dashboard
                </Link>

              ) : (

                <>

                  <Link
                    to="/book"
                    className="hover:text-indigo-300 transition"
                  >
                    Book Parcel
                  </Link>


                  <Link
                    to="/my-parcels"
                    className="hover:text-indigo-300 transition"
                  >
                    My Parcels
                  </Link>

                </>

              )}


              {/* USER INFO */}

              <span className="bg-indigo-600 text-xs px-3 py-1 rounded-full">
                {user.username} ({user.role})
              </span>


              {/* LOGOUT */}

              <button
                type="button"
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition"
              >
                Logout
              </button>

            </>

          ) : (

            <>

              <Link
                to="/login"
                className="hover:text-indigo-300 transition"
              >
                Login
              </Link>


              <Link
                to="/signup"
                className="bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded text-sm transition"
              >
                Signup
              </Link>

            </>

          )}

        </div>

      </div>

    </nav>
  );
}