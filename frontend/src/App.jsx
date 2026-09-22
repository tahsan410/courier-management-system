import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import BookParcel from "./pages/BookParcel";
import MyParcels from "./pages/MyParcels";
import TrackParcel from "./pages/TrackParcel";
import AdminDashboard from "./pages/AdminDashboard";


export default function App() {
  return (
    <AuthProvider>

      <BrowserRouter>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
          }}
        />

        <Navbar />

        <main className="min-h-[85vh]">

          <Routes>

            {/* PUBLIC ROUTES */}

            <Route
              path="/"
              element={<Home />}
            />

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/signup"
              element={<Signup />}
            />

            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />

            <Route
              path="/track"
              element={<TrackParcel />}
            />


            {/* USER PROTECTED ROUTES */}

            <Route
              path="/book"
              element={
                <ProtectedRoute>
                  <BookParcel />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-parcels"
              element={
                <ProtectedRoute>
                  <MyParcels />
                </ProtectedRoute>
              }
            />


            {/* ADMIN PROTECTED ROUTE */}

            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />


            {/* FALLBACK */}

            <Route
              path="*"
              element={<Home />}
            />

          </Routes>

        </main>

        {/* FOOTER */}

        <Footer />

      </BrowserRouter>

    </AuthProvider>
  );
}