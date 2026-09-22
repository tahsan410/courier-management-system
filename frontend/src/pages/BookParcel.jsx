import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function BookParcel() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    receiver_name: "",
    receiver_phone: "",
    delivery_address: "",
    category: "Electronics",
    weight_kg: 1,
  });

  const estimatedCharge =
    60 + Number(formData.weight_kg || 0) * 20;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "weight_kg"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const token = localStorage.getItem("token");

    if (!token || !user) {
      toast.error("Please login first.");
      navigate("/login");
      return;
    }

    if (formData.weight_kg <= 0) {
      toast.error("Weight must be greater than 0.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "https://courier-management-system-fiss.onrender.com/parcels/book",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(formData),
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
          data.detail || "Failed to book parcel"
        );
      }

      toast.success(
        `Parcel booked! Tracking Code: ${data.tracking_code}`
      );

      navigate("/my-parcels");

    } catch (error) {
      console.error(
        "Book parcel error:",
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
          "Failed to book parcel"
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md">

      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Book a New Parcel
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >

        {/* TITLE */}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Parcel Title / Item Description
          </label>

          <input
            type="text"
            name="title"
            required
            disabled={loading}
            className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="e.g. Laptop, Important Documents"
            value={formData.title}
            onChange={handleChange}
          />
        </div>


        {/* RECEIVER */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Receiver Name
            </label>

            <input
              type="text"
              name="receiver_name"
              required
              disabled={loading}
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Receiver name"
              value={formData.receiver_name}
              onChange={handleChange}
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700">
              Receiver Phone
            </label>

            <input
              type="text"
              name="receiver_phone"
              required
              disabled={loading}
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="01XXXXXXXXX"
              value={formData.receiver_phone}
              onChange={handleChange}
            />
          </div>

        </div>


        {/* ADDRESS */}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Delivery Address
          </label>

          <textarea
            name="delivery_address"
            required
            rows="3"
            disabled={loading}
            className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Enter complete delivery address"
            value={formData.delivery_address}
            onChange={handleChange}
          />
        </div>


        {/* CATEGORY + WEIGHT */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>

            <select
              name="category"
              disabled={loading}
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="Electronics">
                Electronics
              </option>

              <option value="Documents">
                Documents
              </option>

              <option value="Clothing">
                Clothing
              </option>

              <option value="Food">
                Food / Groceries
              </option>

              <option value="Others">
                Others
              </option>
            </select>
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700">
              Weight (KG)
            </label>

            <input
              type="number"
              name="weight_kg"
              min="0.5"
              step="0.5"
              required
              disabled={loading}
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.weight_kg}
              onChange={handleChange}
            />
          </div>

        </div>


        {/* CHARGE */}

        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded flex justify-between items-center">

          <span className="font-semibold text-indigo-900">
            Calculated Delivery Charge:
          </span>

          <span className="text-xl font-bold text-indigo-900">
            {estimatedCharge.toFixed(2)} BDT
          </span>

        </div>


        {/* BUTTON */}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
        >
          {loading
            ? "Booking..."
            : "Confirm Booking"}
        </button>

      </form>

    </div>
  );
}