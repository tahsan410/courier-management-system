import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";


export default function ProtectedRoute({
  children,
  role,
}) {
  const {
    user,
    loading,
  } = useContext(AuthContext);

  const location = useLocation();


  // =====================================================
  // CHECKING AUTHENTICATION
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">

          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>

          <p className="text-gray-600">
            Checking authentication...
          </p>

        </div>
      </div>
    );
  }


  // =====================================================
  // USER NOT LOGGED IN
  // =====================================================

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }


  // =====================================================
  // ROLE CHECK
  // =====================================================

  if (
    role &&
    user.role !== role
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  // =====================================================
  // AUTHORIZED
  // =====================================================

  return children;
}