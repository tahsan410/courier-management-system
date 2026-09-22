import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

const API_URL = "https://courier-management-system-fiss.onrender.com";

export default function MyParcels() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const fetchMyParcels = async () => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/parcels/my`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          toast.error("Your session has expired. Please login again.");
          navigate("/login");
          return;
        }

        throw new Error(
          data.detail || "Failed to load your parcels."
        );
      }

      /*
        Backend may return:
        1. An array directly
        2. { parcels: [...] }
      */

      if (Array.isArray(data)) {
        setParcels(data);
      } else if (Array.isArray(data.parcels)) {
        setParcels(data.parcels);
      } else {
        setParcels([]);
      }
    } catch (error) {
      console.error("My parcels error:", error);

      if (
        error instanceof TypeError &&
        error.message === "Failed to fetch"
      ) {
        toast.error(
          "Cannot connect to the backend. Make sure FastAPI is running."
        );
      } else {
        toast.error(
          error.message || "Failed to load parcels."
        );
      }

      setParcels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/login");
        return;
      }

      fetchMyParcels();
    }
  }, [authLoading, user]);

  const getStatusClass = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      case "In Transit":
        return "bg-blue-100 text-blue-700";

      case "Picked Up":
        return "bg-purple-100 text-purple-700";

      case "Pending":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>

          <p className="text-gray-600 font-medium">
            Loading your parcels...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              My Parcels
            </h1>

            <p className="text-gray-500 mt-1">
              View and track all your booked parcels.
            </p>
          </div>

          <div className="flex gap-3">

            <button
              onClick={fetchMyParcels}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded font-semibold text-sm"
            >
              Refresh
            </button>

            <Link
              to="/book"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-semibold text-sm"
            >
              + Book New Parcel
            </Link>

          </div>
        </div>


        {/* EMPTY STATE */}

        {parcels.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-10 text-center">

            <div className="text-5xl mb-4">
              📦
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-2">
              No parcels found
            </h2>

            <p className="text-gray-500 mb-6">
              You haven't booked any parcels yet.
            </p>

            <Link
              to="/book"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded font-semibold"
            >
              Book Your First Parcel
            </Link>

          </div>
        ) : (

          /* PARCEL LIST */

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {parcels.map((parcel) => (

              <div
                key={parcel.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >

                {/* CARD HEADER */}

                <div className="bg-slate-900 text-white p-4">

                  <div className="flex justify-between items-start gap-3">

                    <div>
                      <p className="text-xs text-gray-300 uppercase">
                        Tracking Code
                      </p>

                      <p className="font-mono font-bold text-indigo-300 mt-1 break-all">
                        {parcel.tracking_code || "N/A"}
                      </p>
                    </div>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${getStatusClass(
                        parcel.status
                      )}`}
                    >
                      {parcel.status || "Pending"}
                    </span>

                  </div>

                </div>


                {/* CARD BODY */}

                <div className="p-5 space-y-4">

                  {/* TITLE */}

                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">
                      Parcel
                    </p>

                    <p className="font-bold text-gray-800 text-lg">
                      {parcel.title || "Untitled Parcel"}
                    </p>
                  </div>


                  {/* CATEGORY + WEIGHT */}

                  <div className="grid grid-cols-2 gap-4">

                    <div>
                      <p className="text-xs text-gray-500">
                        Category
                      </p>

                      <p className="font-semibold text-gray-700">
                        {parcel.category || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Weight
                      </p>

                      <p className="font-semibold text-gray-700">
                        {parcel.weight_kg ?? "N/A"} KG
                      </p>
                    </div>

                  </div>


                  {/* RECEIVER */}

                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">
                      Receiver
                    </p>

                    <p className="font-semibold text-gray-800">
                      {parcel.receiver_name || "N/A"}
                    </p>

                    <p className="text-sm text-gray-500">
                      {parcel.receiver_phone || "N/A"}
                    </p>
                  </div>


                  {/* ADDRESS */}

                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">
                      Delivery Address
                    </p>

                    <p className="text-sm text-gray-700">
                      {parcel.delivery_address || "N/A"}
                    </p>
                  </div>


                  {/* CHARGE */}

                  <div className="flex justify-between items-center border-t pt-4">

                    <span className="text-sm text-gray-500">
                      Delivery Charge
                    </span>

                    <span className="font-bold text-indigo-600">
                      {parcel.delivery_charge ?? "0"} BDT
                    </span>

                  </div>


                  {/* DATE */}

                  {parcel.created_at && (
                    <div className="text-xs text-gray-400">
                      Booked:{" "}
                      {new Date(
                        parcel.created_at
                      ).toLocaleString()}
                    </div>
                  )}


                  {/* TRACK BUTTON */}

                  <Link
                    to={`/track?code=${encodeURIComponent(
                      parcel.tracking_code || ""
                    )}`}
                    className="block text-center w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded font-semibold transition"
                  >
                    Track Parcel
                  </Link>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>
    </div>
  );
}