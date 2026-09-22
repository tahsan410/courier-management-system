import { useState } from "react";

import toast from "react-hot-toast";


export default function TrackParcel() {

  const [code, setCode] =
    useState("");

  const [parcel, setParcel] =
    useState(null);

  const [loading, setLoading] =
    useState(false);


  // =====================================================
  // TRACK PARCEL
  // =====================================================

  const handleTrack = async (e) => {

    e.preventDefault();


    const trackingCode =
      code.trim().toUpperCase();


    if (!trackingCode) {
      toast.error(
        "Please enter a tracking code."
      );

      return;
    }


    setLoading(true);
    setParcel(null);


    try {

      const res = await fetch(
        `https://courier-management-system-fiss.onrender.comparcels/track/${encodeURIComponent(
          trackingCode
        )}`
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
          "Tracking code not found"
        );
      }


      setParcel(data);


    } catch (error) {

      console.error(
        "Track parcel error:",
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
          "Tracking failed"
        );
      }


    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // STATUS STYLE
  // =====================================================

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

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };


  return (

    <div className="max-w-xl mx-auto my-12 p-6 bg-white rounded-lg shadow-md">

      <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">
        Track Your Parcel
      </h2>


      <p className="text-center text-sm text-gray-500 mb-6">
        Enter your tracking code to see the latest parcel status.
      </p>


      {/* TRACK FORM */}

      <form
        onSubmit={handleTrack}
        className="flex gap-2 mb-6"
      >

        <input
          type="text"
          required
          disabled={loading}
          placeholder="TRK-ABC12345"
          className="flex-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none uppercase font-mono disabled:bg-gray-100"
          value={code}
          onChange={(e) =>
            setCode(e.target.value)
          }
        />


        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
        >
          {loading
            ? "Searching..."
            : "Track"}
        </button>

      </form>


      {/* LOADING */}

      {loading && (

        <p className="text-center text-gray-500 mb-4">
          Searching for your parcel...
        </p>

      )}


      {/* RESULT */}

      {parcel && (

        <div className="border border-indigo-100 bg-slate-50 p-4 rounded-lg space-y-3">

          {/* STATUS */}

          <div className="flex justify-between items-center border-b pb-3">

            <span className="text-sm text-gray-500">
              Status:
            </span>


            <span
              className={`font-bold uppercase px-3 py-1 rounded-full text-xs ${getStatusClass(
                parcel.status
              )}`}
            >
              {parcel.status}
            </span>

          </div>


          {/* TRACKING CODE */}

          <div>
            <span className="font-semibold text-gray-700">
              Tracking Code:
            </span>{" "}

            <span className="font-mono text-indigo-600 font-bold">
              {parcel.tracking_code}
            </span>
          </div>


          {/* PARCEL */}

          <div>
            <span className="font-semibold text-gray-700">
              Parcel:
            </span>{" "}

            {parcel.title}
          </div>


          {/* CATEGORY */}

          <div>
            <span className="font-semibold text-gray-700">
              Category:
            </span>{" "}

            {parcel.category}{" "}
            ({parcel.weight_kg} KG)
          </div>


          {/* RECEIVER */}

          <div>
            <span className="font-semibold text-gray-700">
              Receiver:
            </span>{" "}

            {parcel.receiver_name}{" "}
            ({parcel.receiver_phone})
          </div>


          {/* ADDRESS */}

          <div>
            <span className="font-semibold text-gray-700">
              Destination:
            </span>{" "}

            {parcel.delivery_address}
          </div>


          {/* CHARGE */}

          <div>
            <span className="font-semibold text-gray-700">
              Delivery Charge:
            </span>{" "}

            {Number(
              parcel.delivery_charge
            ).toFixed(2)}{" "}
            BDT
          </div>


          {/* DATE */}

          <div className="text-xs text-gray-400 pt-3 border-t">

            Booked Date:{" "}

            {parcel.created_at
              ? new Date(
                  parcel.created_at
                ).toLocaleString()
              : "N/A"}

          </div>

        </div>

      )}

    </div>
  );
}