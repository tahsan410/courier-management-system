import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiCheck,
  FiCheckCircle,
  FiCopy,
  FiDollarSign,
  FiMapPin,
  FiPackage,
  FiPhone,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTruck,
  FiUser,
  FiXCircle,
} from "react-icons/fi";

import { api } from "../lib/api";
import useAuth from "../hooks/useAuth";
import useApiError from "../hooks/useApiError";
import useCopy from "../hooks/useCopy";
import useDocumentTitle from "../hooks/useDocumentTitle";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { formatBDT, formatDateTime } from "../lib/constants";

const TABS = ["All", "Pending", "Picked Up", "In Transit", "Delivered", "Cancelled"];

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${tone}`}>
        <Icon size={22} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-2xl font-extrabold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-20 !rounded-none" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-6 w-2/3" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-16" />
        <div className="skeleton h-10" />
      </div>
    </div>
  );
}

export default function MyParcels() {
  useDocumentTitle("My parcels");

  const { user } = useAuth();
  const handleApiError = useApiError();
  const { copied, copy } = useCopy();

  // `tick` identifies the request we want; `result.tick` is the one we have.
  // While they differ we are loading — no setState needed inside the effect.
  const [tick, setTick] = useState(0);
  const [result, setResult] = useState({ tick: -1, parcels: [] });
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [toCancel, setToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const parcels = result.parcels;
  const loading = result.tick !== tick;
  const initialLoading = loading && result.tick === -1;
  const refreshing = loading && !initialLoading;

  const reload = () => setTick((t) => t + 1);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await api.myParcels();
        if (!cancelled) {
          setResult({
            tick,
            parcels: Array.isArray(data) ? data : data.parcels || [],
          });
        }
      } catch (error) {
        if (!cancelled) {
          setResult((prev) => ({ tick, parcels: prev.parcels }));
          handleApiError(error, "Failed to load your parcels.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tick, handleApiError]);

  const confirmCancel = async () => {
    if (!toCancel) return;
    setCancelling(true);

    try {
      const updated = await api.cancelParcel(toCancel.id);
      setResult((prev) => ({
        ...prev,
        parcels: prev.parcels.map((p) => (p.id === updated.id ? updated : p)),
      }));
      toast.success("Parcel cancelled.");
      setToCancel(null);
    } catch (error) {
      if (!handleApiError(error, "Could not cancel parcel.")) {
        // e.g. parcel was already processed — refresh to show the truth
        setToCancel(null);
        reload();
      }
    } finally {
      setCancelling(false);
    }
  };

  const stats = useMemo(() => {
    const active = parcels.filter((p) => ["Pending", "Picked Up", "In Transit"].includes(p.status)).length;
    const delivered = parcels.filter((p) => p.status === "Delivered").length;
    const spent = parcels
      .filter((p) => p.status !== "Cancelled")
      .reduce((sum, p) => sum + (Number(p.delivery_charge) || 0), 0);
    return { total: parcels.length, active, delivered, spent };
  }, [parcels]);

  const counts = useMemo(() => {
    const c = { All: parcels.length };
    parcels.forEach((p) => {
      c[p.status] = (c[p.status] || 0) + 1;
    });
    return c;
  }, [parcels]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return parcels.filter((p) => {
      if (tab !== "All" && p.status !== tab) return false;
      if (!q) return true;
      return [p.tracking_code, p.title, p.receiver_name]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [parcels, tab, query]);

  return (
    <>
      <PageHeader
        eyebrow="My account"
        title={`Hello, ${user?.username || "there"} 👋`}
        subtitle="View, track and manage all the parcels you've booked."
      >
        <div className="flex flex-wrap gap-3">
          <Link to="/book" className="btn btn-accent">
            <FiPlus /> Book new parcel
          </Link>
          <button
            type="button"
            onClick={reload}
            disabled={loading}
            className="btn btn-outline-light"
          >
            <FiRefreshCw className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </PageHeader>

      <div className="container-page py-10">
        {/* STATS */}
        <div className="relative z-10 -mt-20 mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={FiPackage} label="Total parcels" value={stats.total} tone="bg-brand-50 text-brand-600" />
          <StatCard icon={FiTruck} label="In progress" value={stats.active} tone="bg-sky-50 text-sky-600" />
          <StatCard icon={FiCheckCircle} label="Delivered" value={stats.delivered} tone="bg-emerald-50 text-emerald-600" />
          <StatCard icon={FiDollarSign} label="Total spent" value={formatBDT(stats.spent)} tone="bg-amber-50 text-amber-600" />
        </div>

        {/* TOOLBAR */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  tab === t
                    ? "bg-brand-600 text-white shadow-md shadow-brand-600/25"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {t}
                <span
                  className={`rounded-full px-1.5 text-xs ${
                    tab === t ? "bg-white/20" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {counts[t] || 0}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full lg:max-w-xs">
            <FiSearch className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search code, title, receiver…"
              className="input pl-11"
              aria-label="Search parcels"
            />
          </div>
        </div>

        {/* LIST */}
        {initialLoading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : parcels.length === 0 ? (
          <EmptyState
            icon={FiPackage}
            title="No parcels yet"
            text="You haven't booked any parcels. Book your first one in under a minute."
            action={
              <Link to="/book" className="btn btn-primary">
                <FiPlus /> Book your first parcel
              </Link>
            }
          />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={FiSearch}
            title="No matching parcels"
            text="Try a different status tab or search term."
            action={
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setTab("All");
                  setQuery("");
                }}
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((parcel) => (
              <article key={parcel.id} className="card card-hover flex flex-col overflow-hidden">
                {/* HEADER */}
                <div className="flex items-start justify-between gap-3 bg-ink px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                      Tracking code
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <p className="truncate font-mono font-bold text-brand-300">
                        {parcel.tracking_code}
                      </p>
                      <button
                        type="button"
                        onClick={() => copy(parcel.tracking_code, "Tracking code copied")}
                        className="text-slate-400 hover:text-white"
                        aria-label="Copy tracking code"
                      >
                        {copied === parcel.tracking_code ? <FiCheck className="text-emerald-400" size={14} /> : <FiCopy size={14} />}
                      </button>
                    </div>
                  </div>
                  <StatusBadge status={parcel.status} size="sm" />
                </div>

                {/* BODY */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-bold text-slate-900">{parcel.title}</h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {parcel.category} · {parcel.weight_kg} KG
                  </p>

                  <div className="mt-4 space-y-2.5 text-sm">
                    <p className="flex items-center gap-2.5 text-slate-700">
                      <FiUser className="shrink-0 text-slate-400" />
                      <span className="font-semibold">{parcel.receiver_name}</span>
                    </p>
                    <p className="flex items-center gap-2.5 text-slate-700">
                      <FiPhone className="shrink-0 text-slate-400" />
                      {parcel.receiver_phone}
                    </p>
                    <p className="flex items-start gap-2.5 text-slate-700">
                      <FiMapPin className="mt-0.5 shrink-0 text-slate-400" />
                      <span className="line-clamp-2">{parcel.delivery_address}</span>
                    </p>
                  </div>

                  <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs text-slate-400">Booked</p>
                      <p className="text-xs font-semibold text-slate-600">
                        {formatDateTime(parcel.created_at)}
                      </p>
                    </div>
                    <p className="text-xl font-extrabold text-brand-600">
                      {formatBDT(parcel.delivery_charge)}
                    </p>
                  </div>

                  <div className="mt-5 flex gap-2">
                    <Link
                      to={`/track?code=${encodeURIComponent(parcel.tracking_code || "")}`}
                      className="btn btn-primary flex-1"
                    >
                      Track
                    </Link>
                    {parcel.status === "Pending" && (
                      <button
                        type="button"
                        onClick={() => setToCancel(parcel)}
                        className="btn btn-secondary text-rose-600 hover:!border-rose-200 hover:!bg-rose-50"
                      >
                        <FiXCircle /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!toCancel}
        loading={cancelling}
        title="Cancel this parcel?"
        message={`“${toCancel?.title || ""}” (${toCancel?.tracking_code || ""}) will be cancelled. This can't be undone.`}
        confirmText="Yes, cancel parcel"
        cancelText="Keep parcel"
        onConfirm={confirmCancel}
        onCancel={() => setToCancel(null)}
      />
    </>
  );
}
