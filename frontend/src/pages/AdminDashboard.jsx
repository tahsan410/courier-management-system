import {
  useState,
  useEffect,
  useContext,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

import toast from "react-hot-toast";


export default function AdminDashboard() {

  const {
    user,
    loading: authLoading,
  } = useContext(AuthContext);

  const navigate = useNavigate();


  const [parcels, setParcels] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("All");

  const [status, setStatus] =
    useState("All");

  const [sortBy, setSortBy] =
    useState("newest");

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [updatingId, setUpdatingId] =
    useState(null);

  const [deletingId, setDeletingId] =
    useState(null);


  // =====================================================
  // FETCH ADMIN PARCELS
  // =====================================================

  const fetchAdminParcels = async () => {

    const token =
      localStorage.getItem("token");


    if (!token) {
      navigate("/login");
      return;
    }


    if (!user || user.role !== "admin") {
      return;
    }


    setLoading(true);


    try {

      const query =
        new URLSearchParams({
          search,
          category,
          status,
          sort_by: sortBy,
          page: page.toString(),
          size: "8",
        });


      const res = await fetch(
        `http://127.0.0.1:8000/admin/parcels?${query.toString()}`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      let data;

      try {
        data = await res.json();
      } catch {
        data = {};
      }


      // SESSION EXPIRED

      if (res.status === 401) {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        toast.error(
          "Your session has expired. Please login again."
        );

        navigate("/login");

        return;
      }


      // FORBIDDEN

      if (res.status === 403) {

        toast.error(
          "You do not have admin permission."
        );

        navigate("/");

        return;
      }


      if (!res.ok) {
        throw new Error(
          data.detail ||
          "Failed to fetch admin parcels"
        );
      }


      setParcels(
        Array.isArray(data.parcels)
          ? data.parcels
          : []
      );


      setTotalPages(
        Math.max(
          Number(data.total_pages) || 1,
          1
        )
      );


    } catch (error) {

      console.error(
        "Admin parcels error:",
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
          "Failed to load admin parcels."
        );
      }


    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // AUTH CHECK + FETCH
  // =====================================================

  useEffect(() => {

    if (authLoading) {
      return;
    }


    if (!user) {

      navigate("/login", {
        replace: true,
      });

      return;
    }


    if (user.role !== "admin") {

      toast.error(
        "Admin access required."
      );

      navigate("/", {
        replace: true,
      });

      return;
    }


    fetchAdminParcels();

  }, [
    authLoading,
    user,
    search,
    category,
    status,
    sortBy,
    page,
  ]);


  // =====================================================
  // STATUS UPDATE
  // =====================================================

  const handleStatusChange = async (
    id,
    newStatus
  ) => {

    const token =
      localStorage.getItem("token");


    if (!token) {

      toast.error(
        "Please login again."
      );

      navigate("/login");

      return;
    }


    setUpdatingId(id);


    try {

      const res = await fetch(
        `http://127.0.0.1:8000/admin/parcels/${id}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );


      let data;

      try {
        data = await res.json();
      } catch {
        data = {};
      }


      if (res.status === 401) {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        toast.error(
          "Your session has expired."
        );

        navigate("/login");

        return;
      }


      if (res.status === 403) {

        toast.error(
          "You do not have admin permission."
        );

        navigate("/");

        return;
      }


      if (!res.ok) {
        throw new Error(
          data.detail ||
          "Status update failed."
        );
      }


      toast.success(
        "Status updated successfully."
      );


      await fetchAdminParcels();


    } catch (error) {

      console.error(
        "Status update error:",
        error
      );

      toast.error(
        error.message ||
        "Status update failed."
      );

    } finally {

      setUpdatingId(null);

    }
  };


  // =====================================================
  // DELETE PARCEL
  // =====================================================

  const handleDelete = async (id) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this parcel record?"
      );


    if (!confirmed) {
      return;
    }


    const token =
      localStorage.getItem("token");


    if (!token) {

      toast.error(
        "Please login again."
      );

      navigate("/login");

      return;
    }


    setDeletingId(id);


    try {

      const res = await fetch(
        `http://127.0.0.1:8000/admin/parcels/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );


      let data;

      try {
        data = await res.json();
      } catch {
        data = {};
      }


      if (res.status === 401) {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        toast.error(
          "Your session has expired."
        );

        navigate("/login");

        return;
      }


      if (res.status === 403) {

        toast.error(
          "You do not have admin permission."
        );

        navigate("/");

        return;
      }


      if (!res.ok) {
        throw new Error(
          data.detail ||
          "Delete failed."
        );
      }


      toast.success(
        "Parcel deleted successfully."
      );


      /*
       * If the current page becomes empty after
       * deleting the last item, go back one page.
       */

      if (
        parcels.length === 1 &&
        page > 1
      ) {
        setPage(
          (prev) =>
            Math.max(prev - 1, 1)
        );
      } else {
        await fetchAdminParcels();
      }


    } catch (error) {

      console.error(
        "Delete parcel error:",
        error
      );

      toast.error(
        error.message ||
        "Delete failed."
      );

    } finally {

      setDeletingId(null);

    }
  };


  // =====================================================
  // RESET FILTERS
  // =====================================================

  const resetFilters = () => {

    setSearch("");
    setCategory("All");
    setStatus("All");
    setSortBy("newest");
    setPage(1);

  };


  // =====================================================
  // AUTH LOADING
  // =====================================================

  if (authLoading) {

    return (
      <div className="min-h-[60vh] flex items-center justify-center">

        <div className="text-center">

          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>

          <p className="text-gray-600">
            Checking admin access...
          </p>

        </div>

      </div>
    );
  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="max-w-7xl mx-auto my-8 p-4">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">

        <div>

          <h2 className="text-2xl font-bold text-gray-800">
            Admin Parcel Management
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Manage, filter and update all parcel records.
          </p>

        </div>


        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
          Admin: {user?.username}
        </span>

      </div>


      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">

        {/* SEARCH */}

        <input
          type="text"
          placeholder="Search title, receiver, code..."
          className="p-2 border rounded outline-none text-sm focus:ring-2 focus:ring-indigo-500"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />


        {/* CATEGORY */}

        <select
          className="p-2 border rounded outline-none text-sm focus:ring-2 focus:ring-indigo-500"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >

          <option value="All">
            All Categories
          </option>

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
            Food
          </option>

          <option value="Others">
            Others
          </option>

        </select>


        {/* STATUS */}

        <select
          className="p-2 border rounded outline-none text-sm focus:ring-2 focus:ring-indigo-500"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >

          <option value="All">
            All Statuses
          </option>

          <option value="Pending">
            Pending
          </option>

          <option value="Picked Up">
            Picked Up
          </option>

          <option value="In Transit">
            In Transit
          </option>

          <option value="Delivered">
            Delivered
          </option>

          <option value="Cancelled">
            Cancelled
          </option>

        </select>


        {/* SORT */}

        <select
          className="p-2 border rounded outline-none text-sm focus:ring-2 focus:ring-indigo-500"
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
        >

          <option value="newest">
            Sort: Newest
          </option>

          <option value="oldest">
            Sort: Oldest
          </option>

          <option value="price_low">
            Price: Low to High
          </option>

          <option value="price_high">
            Price: High to Low
          </option>

          <option value="weight">
            Weight: High to Low
          </option>

        </select>


        {/* RESET */}

        <button
          type="button"
          onClick={resetFilters}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded text-sm font-semibold transition"
        >
          Reset Filters
        </button>

      </div>


      {/* =====================================================
          TABLE
      ===================================================== */}

      {loading ? (

        <div className="text-center py-12 bg-white rounded shadow">

          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>

          <p className="text-gray-500">
            Loading parcels...
          </p>

        </div>

      ) : parcels.length === 0 ? (

        <div className="text-center text-gray-500 py-12 bg-white rounded shadow">
          No parcels found.
        </div>

      ) : (

        <div className="overflow-x-auto bg-white shadow rounded-lg">

          <table className="w-full text-left border-collapse">

            <thead>

              <tr className="bg-gray-100 text-gray-700 text-xs uppercase">

                <th className="p-3">
                  Tracking Code
                </th>

                <th className="p-3">
                  Title
                </th>

                <th className="p-3">
                  Receiver Info
                </th>

                <th className="p-3">
                  Charge
                </th>

                <th className="p-3">
                  Current Status
                </th>

                <th className="p-3">
                  Update Status
                </th>

                <th className="p-3">
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {parcels.map((p) => (

                <tr
                  key={p.id}
                  className="border-t text-sm hover:bg-gray-50"
                >

                  {/* TRACKING */}

                  <td className="p-3 font-mono font-bold text-indigo-600">

                    {p.tracking_code}

                  </td>


                  {/* TITLE */}

                  <td className="p-3 font-medium">

                    <div>
                      {p.title}
                    </div>

                    <div className="text-xs text-gray-500 mt-1">
                      {p.category} • {p.weight_kg} KG
                    </div>

                  </td>


                  {/* RECEIVER */}

                  <td className="p-3">

                    <div>
                      {p.receiver_name}
                    </div>

                    <div className="text-xs text-gray-500">
                      {p.receiver_phone}
                    </div>

                    <div className="text-xs text-gray-500 max-w-xs">
                      {p.delivery_address}
                    </div>

                  </td>


                  {/* CHARGE */}

                  <td className="p-3 font-semibold whitespace-nowrap">

                    {Number(
                      p.delivery_charge
                    ).toFixed(2)}{" "}
                    BDT

                  </td>


                  {/* CURRENT STATUS */}

                  <td className="p-3">

                    <span
                      className={`px-2 py-1 text-xs rounded font-semibold ${
                        p.status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : p.status === "Cancelled"
                          ? "bg-red-100 text-red-700"
                          : p.status === "In Transit"
                          ? "bg-blue-100 text-blue-700"
                          : p.status === "Picked Up"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {p.status}
                    </span>

                  </td>


                  {/* UPDATE */}

                  <td className="p-3">

                    <select
                      disabled={
                        updatingId === p.id
                      }
                      className="p-1 border rounded text-xs bg-white disabled:bg-gray-100"
                      value={p.status}
                      onChange={(e) =>
                        handleStatusChange(
                          p.id,
                          e.target.value
                        )
                      }
                    >

                      <option value="Pending">
                        Pending
                      </option>

                      <option value="Picked Up">
                        Picked Up
                      </option>

                      <option value="In Transit">
                        In Transit
                      </option>

                      <option value="Delivered">
                        Delivered
                      </option>

                      <option value="Cancelled">
                        Cancelled
                      </option>

                    </select>

                  </td>


                  {/* DELETE */}

                  <td className="p-3">

                    <button
                      type="button"
                      disabled={
                        deletingId === p.id
                      }
                      onClick={() =>
                        handleDelete(p.id)
                      }
                      className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-xs"
                    >
                      {deletingId === p.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}


      {/* =====================================================
          PAGINATION
      ===================================================== */}

      <div className="flex justify-between items-center mt-6">

        <button
          type="button"
          disabled={
            loading ||
            page === 1
          }
          onClick={() =>
            setPage(
              (prev) =>
                Math.max(prev - 1, 1)
            )
          }
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
        >
          Previous
        </button>


        <span className="text-sm font-medium">

          Page {page} of {totalPages}

        </span>


        <button
          type="button"
          disabled={
            loading ||
            page >= totalPages
          }
          onClick={() =>
            setPage(
              (prev) =>
                Math.min(
                  prev + 1,
                  totalPages
                )
            )
          }
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
        >
          Next
        </button>

      </div>

    </div>
  );
}