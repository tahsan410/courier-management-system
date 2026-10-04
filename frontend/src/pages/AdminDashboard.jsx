import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiCheckCircle,
  FiDollarSign,
  FiDownload,
  FiEye,
  FiInbox,
  FiMapPin,
  FiPackage,
  FiPhone,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiTruck,
  FiUser,
  FiX,
} from "react-icons/fi";

import { api } from "../lib/api";
import useAuth from "../hooks/useAuth";
import useApiError from "../hooks/useApiError";
import useDocumentTitle from "../hooks/useDocumentTitle";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import StatusTimeline from "../components/StatusTimeline";
import { Spinner } from "../components/Spinner";
import {
  CATEGORIES,
  STATUSES,
  formatBDT,
  formatDateTime,
} from "../lib/constants";

const PAGE_SIZE = 8;
const STATS_SIZE = 1000; // how many parcels the overview cards are computed from

/* ---------------------------------------------------------
   Small presentational pieces
--------------------------------------------------------- */
function StatCard({ icon: Icon, label, value, tone, loading }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${tone}`}>
        <Icon size={22} />
      </span>
      <div className="min-w-0">
        {loading ? (
          <div className="skeleton h-7 w-16" />
        ) : (
          <p className="truncate text-2xl font-extrabold text-slate-900">{value}</p>
        )}
        <p className="mt-0.5 text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function StatusSelect({ parcel, disabled, onChange }) {
  return (
    <div className="relative inline-block">
      <select
        value={parcel.status}
        disabled={disabled}
        onChange={(e) => onChange(parcel, e.target.value)}
        aria-label={`Update status for ${parcel.tracking_code}`}
        className="cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pr-8 pl-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none disabled:cursor-wait disabled:opacity-60"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-2.5 grid place-items-center text-slate-400">
        {disabled ? <Spinner size={13} /> : <FiChevronRight size={13} className="rotate-90" />}
      </span>
    </div>
  );
}

function Pagination({ page, totalPages, total, size, onChange }) {
  const from = total === 0 ? 0 : (page - 1) * size + 1;
  const to = Math.min(page * size, total);

  // compact page window: 1 … 4 5 [6] 7 8 … 20
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-800">{from}–{to}</span> of{" "}
        <span className="font-semibold text-slate-800">{total}</span> parcels
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="btn btn-secondary btn-sm !px-2.5"
          aria-label="Previous page"
        >
          <FiChevronLeft size={16} />
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`gap-${i}`} className="px-1.5 text-slate-400">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`h-8 min-w-8 rounded-lg px-2 text-xs font-bold transition ${
                p === page
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/25"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="btn btn-secondary btn-sm !px-2.5"
          aria-label="Next page"
        >
          <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function DetailsModal({ parcel, onClose }) {
  useEffect(() => {
    if (!parcel) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [parcel, onClose]);

  if (!parcel) return null;

  const rows = [
    { icon: FiPackage, label: "Parcel", value: `${parcel.title} · ${parcel.category} · ${parcel.weight_kg} KG` },
    { icon: FiUser, label: "Receiver", value: parcel.receiver_name },
    { icon: FiPhone, label: "Phone", value: parcel.receiver_phone },
    { icon: FiMapPin, label: "Address", value: parcel.delivery_address },
    { icon: FiClock, label: "Booked", value: formatDateTime(parcel.created_at) },
    { icon: FiUser, label: "Sender ID", value: `#${parcel.sender_id}` },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="my-8 w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-lift animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 bg-ink px-6 py-5">
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Tracking code
            </p>
            <p className="font-mono text-xl font-extrabold text-brand-300">{parcel.tracking_code}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <StatusBadge status={parcel.status} />
            <p className="text-2xl font-extrabold text-slate-900">{formatBDT(parcel.delivery_charge)}</p>
          </div>

          <StatusTimeline status={parcel.status} />

          <dl className="space-y-3.5 border-t border-slate-100 pt-5">
            {rows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex gap-3">
                <Icon className="mt-0.5 shrink-0 text-slate-400" size={16} />
                <div className="min-w-0">
                  <dt className="text-xs font-bold tracking-wider text-slate-400 uppercase">{label}</dt>
                  <dd className="font-medium break-words text-slate-800">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   CSV helper (guards against spreadsheet formula injection)
--------------------------------------------------------- */
function toCsv(rows) {
  const header = [
    "Tracking Code",
    "Title",
    "Category",
    "Weight (KG)",
    "Receiver",
    "Phone",
    "Address",
    "Charge (BDT)",
    "Status",
    "Booked At",
  ];

  const cell = (v) => {
    let s = String(v ?? "");
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };

  const lines = rows.map((p) =>
    [
      p.tracking_code,
      p.title,
      p.category,
      p.weight_kg,
      p.receiver_name,
      p.receiver_phone,
      p.delivery_address,
      p.delivery_charge,
      p.status,
      p.created_at,
    ]
      .map(cell)
      .join(",")
  );

  return [header.map(cell).join(","), ...lines].join("\n");
}

/* ---------------------------------------------------------
   PAGE
--------------------------------------------------------- */
export default function AdminDashboard() {
  useDocumentTitle("Admin dashboard");

  const { user } = useAuth();
  const handleApiError = useApiError();

  // filters
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [reloadTick, setReloadTick] = useState(0);
  const [statsTick, setStatsTick] = useState(0);

  // The list is "loading" whenever the result we hold was fetched for a
  // different query than the one currently selected (no setState in effects).
  const queryKey = [search, category, status, sortBy, page, reloadTick].join("|");
  const [result, setResult] = useState({
    key: null,
    parcels: [],
    total: 0,
    totalPages: 1,
  });
  const loading = result.key !== queryKey;
  const { parcels, total, totalPages } = result;

  // overview stats
  const [statsRes, setStatsRes] = useState({ tick: -1, data: null });
  const stats = statsRes.data;
  const statsLoading = statsRes.tick !== statsTick;

  // actions
  const [updatingId, setUpdatingId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState(null);
  const [exporting, setExporting] = useState(false);

  /* ---------- fetch list ---------- */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await api.adminParcels({
          search,
          category,
          status,
          sort_by: sortBy,
          page: String(page),
          size: String(PAGE_SIZE),
        });

        if (cancelled) return;

        const list = Array.isArray(data.parcels) ? data.parcels : [];
        const pages = Math.max(Number(data.total_pages) || 1, 1);

        setResult({
          key: queryKey,
          parcels: list,
          total: Number(data.total) || 0,
          totalPages: pages,
        });

        // e.g. deleted the last item on the last page
        if (list.length === 0 && page > 1) setPage(Math.min(page - 1, pages));
      } catch (error) {
        if (cancelled) return;
        setResult({ key: queryKey, parcels: [], total: 0, totalPages: 1 });
        handleApiError(error, "Failed to load parcels.");
      }
    })();

    return () => {
      cancelled = true;
    };
    // queryKey already encodes every filter value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, handleApiError]);

  /* ---------- fetch overview stats ---------- */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await api.adminParcels({
          search: "",
          category: "All",
          status: "All",
          sort_by: "newest",
          page: "1",
          size: String(STATS_SIZE),
        });

        if (cancelled) return;

        const all = Array.isArray(data.parcels) ? data.parcels : [];
        const count = (s) => all.filter((p) => p.status === s).length;

        setStatsRes({
          tick: statsTick,
          data: {
            total: Number(data.total) || all.length,
            pending: count("Pending"),
            transit: count("Picked Up") + count("In Transit"),
            delivered: count("Delivered"),
            cancelled: count("Cancelled"),
            revenue: all
              .filter((p) => p.status !== "Cancelled")
              .reduce((sum, p) => sum + (Number(p.delivery_charge) || 0), 0),
            partial: (Number(data.total) || 0) > all.length,
          },
        });
      } catch (error) {
        if (cancelled) return;
        setStatsRes((prev) => ({ tick: statsTick, data: prev.data }));
        handleApiError(error, "Failed to load overview stats.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [statsTick, handleApiError]);

  /* ---------- debounced search ---------- */
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  /* ---------- actions ---------- */
  const refreshAll = () => {
    setReloadTick((t) => t + 1);
    setStatsTick((t) => t + 1);
  };

  const handleStatusChange = async (parcel, newStatus) => {
    if (newStatus === parcel.status) return;
    setUpdatingId(parcel.id);

    try {
      await api.adminUpdateStatus(parcel.id, newStatus);
      toast.success(`${parcel.tracking_code} → ${newStatus}`);
      refreshAll();
    } catch (error) {
      handleApiError(error, "Status update failed.");
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);

    try {
      await api.adminDeleteParcel(toDelete.id);
      toast.success("Parcel deleted successfully.");
      setToDelete(null);
      refreshAll();
    } catch (error) {
      handleApiError(error, "Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      // export everything that matches the current filters
      const data = await api.adminParcels({
        search,
        category,
        status,
        sort_by: sortBy,
        page: "1",
        size: String(Math.min(Math.max(total, 1), 5000)),
      });

      const rows = Array.isArray(data.parcels) ? data.parcels : [];
      if (rows.length === 0) return toast.error("Nothing to export.");

      const blob = new Blob([`\uFEFF${toCsv(rows)}`], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `parcels-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${rows.length} parcels`);
    } catch (error) {
      handleApiError(error, "Export failed.");
    } finally {
      setExporting(false);
    }
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setCategory("All");
    setStatus("All");
    setSortBy("newest");
    setPage(1);
  };

  const filtersActive =
    search || category !== "All" || status !== "All" || sortBy !== "newest";

  return (
    <>
      <PageHeader
        eyebrow={`Admin · ${user?.username || ""}`}
        title="Parcel management"
        subtitle="Monitor every shipment, update delivery statuses and keep your operations moving."
      >
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={refreshAll}
            disabled={loading}
            className="btn btn-outline-light"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={exporting || total === 0}
            className="btn btn-accent"
          >
            {exporting ? <Spinner size={16} /> : <FiDownload />} Export CSV
          </button>
        </div>
      </PageHeader>

      <div className="container-page py-10">
        {/* STATS */}
        <div className="relative z-10 -mt-20 mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard loading={statsLoading} icon={FiPackage} label="Total parcels" value={stats?.total ?? 0} tone="bg-brand-50 text-brand-600" />
          <StatCard loading={statsLoading} icon={FiClock} label="Pending" value={stats?.pending ?? 0} tone="bg-amber-50 text-amber-600" />
          <StatCard loading={statsLoading} icon={FiTruck} label="Picked up / In transit" value={stats?.transit ?? 0} tone="bg-sky-50 text-sky-600" />
          <StatCard loading={statsLoading} icon={FiCheckCircle} label="Delivered" value={stats?.delivered ?? 0} tone="bg-emerald-50 text-emerald-600" />
          <div className="col-span-2 lg:col-span-1">
            <StatCard loading={statsLoading} icon={FiDollarSign} label="Revenue (excl. cancelled)" value={formatBDT(stats?.revenue ?? 0)} tone="bg-violet-50 text-violet-600" />
          </div>
        </div>
        {stats?.partial && (
          <p className="-mt-4 mb-6 text-xs text-slate-400">
            Overview figures are based on the latest {STATS_SIZE} parcels.
          </p>
        )}

        {/* FILTERS */}
        <div className="card mb-6 grid gap-3 p-4 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, receiver, code…"
              aria-label="Search parcels"
              className="input pl-11"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <select
            aria-label="Category"
            className="input"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Status"
            className="input"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            aria-label="Sort by"
            className="input"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="price_low">Price: low → high</option>
            <option value="price_high">Price: high → low</option>
            <option value="weight">Weight: high → low</option>
          </select>

          <button
            type="button"
            onClick={resetFilters}
            disabled={!filtersActive}
            className="btn btn-secondary"
          >
            <FiX /> Reset
          </button>
        </div>

        {/* CONTENT */}
        {loading && parcels.length === 0 ? (
          <div className="card space-y-3 p-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-14" />
            ))}
          </div>
        ) : parcels.length === 0 ? (
          <EmptyState
            icon={FiInbox}
            title="No parcels found"
            text={filtersActive ? "No parcels match your current filters." : "No parcels have been booked yet."}
            action={
              filtersActive && (
                <button type="button" className="btn btn-secondary" onClick={resetFilters}>
                  Clear filters
                </button>
              )
            }
          />
        ) : (
          <div className={`transition-opacity ${loading ? "opacity-60" : ""}`}>
            {/* DESKTOP TABLE */}
            <div className="card hidden overflow-hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-bold tracking-wider text-slate-500 uppercase">
                    <tr>
                      <th className="px-5 py-3.5">Tracking</th>
                      <th className="px-4 py-3.5">Parcel</th>
                      <th className="px-4 py-3.5">Receiver</th>
                      <th className="px-4 py-3.5">Charge</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Update</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parcels.map((p) => (
                      <tr key={p.id} className="transition hover:bg-slate-50/70">
                        <td className="px-5 py-4">
                          <p className="font-mono text-xs font-bold text-brand-700">{p.tracking_code}</p>
                          <p className="mt-0.5 text-xs text-slate-400">{formatDateTime(p.created_at)}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-900">{p.title}</p>
                          <p className="text-xs text-slate-500">
                            {p.category} · {p.weight_kg} KG
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-800">{p.receiver_name}</p>
                          <p className="text-xs text-slate-500">{p.receiver_phone}</p>
                        </td>
                        <td className="px-4 py-4 font-bold whitespace-nowrap text-slate-900">
                          {formatBDT(p.delivery_charge)}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={p.status} size="sm" />
                        </td>
                        <td className="px-4 py-4">
                          <StatusSelect parcel={p} disabled={updatingId === p.id} onChange={handleStatusChange} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelected(p)}
                              className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-brand-50 hover:text-brand-600"
                              aria-label="View details"
                              title="View details"
                            >
                              <FiEye size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setToDelete(p)}
                              className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                              aria-label="Delete parcel"
                              title="Delete parcel"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MOBILE CARDS */}
            <div className="grid gap-4 md:grid-cols-2 lg:hidden">
              {parcels.map((p) => (
                <div key={p.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-bold text-brand-700">{p.tracking_code}</p>
                      <p className="mt-1 font-bold text-slate-900">{p.title}</p>
                      <p className="text-xs text-slate-500">
                        {p.category} · {p.weight_kg} KG
                      </p>
                    </div>
                    <StatusBadge status={p.status} size="sm" />
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold text-slate-800">{p.receiver_name}</p>
                      <p className="text-xs text-slate-500">{p.receiver_phone}</p>
                    </div>
                    <p className="text-lg font-extrabold text-slate-900">{formatBDT(p.delivery_charge)}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                    <StatusSelect parcel={p} disabled={updatingId === p.id} onChange={handleStatusChange} />
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelected(p)}
                        className="btn btn-secondary btn-sm"
                      >
                        <FiEye size={14} /> View
                      </button>
                      <button
                        type="button"
                        onClick={() => setToDelete(p)}
                        className="btn btn-secondary btn-sm text-rose-600"
                        aria-label="Delete parcel"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                size={PAGE_SIZE}
                onChange={(p) => setPage(Math.min(Math.max(p, 1), totalPages))}
              />
            </div>
          </div>
        )}
      </div>

      <DetailsModal parcel={selected} onClose={() => setSelected(null)} />

      <ConfirmDialog
        open={!!toDelete}
        loading={deleting}
        title="Delete this parcel?"
        message={`${toDelete?.tracking_code || ""} (“${toDelete?.title || ""}”) will be permanently removed. This action cannot be undone.`}
        confirmText="Delete parcel"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
