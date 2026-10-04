import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "./useAuth";

/**
 * Central error handler for authenticated API calls.
 *  - 401 → clear session, send to login (and remember where we were)
 *  - 403 → no permission, send home
 *  - everything else → show the backend message
 * Returns true when the error caused a redirect.
 */
export default function useApiError() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (error, fallback = "Something went wrong.") => {
      if (error?.status === 401) {
        logout();
        toast.error("Your session has expired. Please log in again.");
        navigate("/login", {
          replace: true,
          state: { from: location.pathname },
        });
        return true;
      }

      if (error?.status === 403) {
        toast.error("You do not have permission to do that.");
        navigate("/", { replace: true });
        return true;
      }

      console.error(error);
      toast.error(error?.message || fallback);
      return false;
    },
    [logout, navigate, location.pathname]
  );
}
