import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FiBox,
  FiCheck,
  FiCopy,
  FiLink,
  FiMapPin,
  FiPhone,
  FiSearch,
  FiUser,
} from "react-icons/fi";

import { api } from "../lib/api";
import useCopy from "../hooks/useCopy";
import useDocumentTitle from "../hooks/useDocumentTitle";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import StatusTimeline from "../components/StatusTimeline";
import { Spinner } from "../components/Spinner";
import {
  formatBDT,
  formatDateTime,
  maskPhone,
} from "../lib/constants";

function Detail({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
        <Icon size={17} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">{label}</p>
        <div className="mt-0.5 font-semibold break-words text-slate-900">{children}</div>
      </div>
    </div>
  );
}

export default function TrackParcel() {
  useDocumentTitle("Track parcel");

  const [searchParams, setSearchParams] = useSearchParams();
  const codeParam = (searchParams.get("code") || "").trim().toUpperCase();

  const [code, setCode] = useState(codeParam);
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { copied, copy } = useCopy();

  // Whenever ?code=... changes (typed, shared link, or from My Parcels) → search
  useEffect(() => {
    if (!codeParam) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      setParcel(null);

      try {
        const data = await api.trackParcel(codeParam);
        if (!cancelled) setParcel(data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Tracking failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [codeParam]);

  const handleTrack = (e) => {
    e.preventDefault();
    const trackingCode = code.trim().toUpperCase();
    if (!trackingCode) return;
    setCode(trackingCode);
    setSearchParams({ code: trackingCode });
  };

  const shareLink = parcel
    ? `${window.location.origin}/track?code=${encodeURIComponent(parcel.tracking_code)}`
    : "";

  return (
    <>
      <PageHeader
        eyebrow="Parcel tracking"
        title="Where is your parcel?"
        subtitle="Enter your tracking code to see the latest status. No login required."
      >
        <form onSubmit={handleTrack} className="flex max-w-xl flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur sm:flex-row">
          <div className="relative flex-1">
            <FiSearch className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              disabled={loading}
              placeholder="TRK-AB12CD34"
              aria-label="Tracking code"
              className="w-full rounded-xl bg-transparent py-3.5 pr-4 pl-11 font-mono text-sm text-white uppercase placeholder:text-slate-400 focus:outline-none disabled:opacity-60"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-accent px-7 py-3.5">
            {loading ? (
              <>
                <Spinner size={16} /> Searching
              </>
            ) : (
              "Track"
            )}
          </button>
        </form>
      </PageHeader>

      <section className="container-page py-12">
        <div className="mx-auto max-w-4xl">
          {/* LOADING SKELETON */}
          {loading && (
            <div className="card space-y-6 p-8">
              <div className="skeleton h-8 w-1/3" />
              <div className="skeleton h-16 w-full" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="skeleton h-14" />
                <div className="skeleton h-14" />
                <div className="skeleton h-14" />
                <div className="skeleton h-14" />
              </div>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="card p-10 text-center animate-fade-in">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-rose-50 text-rose-500">
                <FiBox size={28} />
              </span>
              <h2 className="mt-4 text-xl font-bold text-slate-900">Parcel not found</h2>
              <p className="mt-1 text-slate-500">{error}</p>
              <p className="mt-1 text-sm text-slate-400">
                Please double-check the code <span className="font-mono font-semibold">{codeParam}</span> and try again.
              </p>
            </div>
          )}

          {/* EMPTY / INITIAL */}
          {!loading && !error && !parcel && (
            <div className="card p-10 text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <FiSearch size={28} />
              </span>
              <h2 className="mt-4 text-xl font-bold text-slate-900">Enter a tracking code</h2>
              <p className="mx-auto mt-1 max-w-md text-slate-500">
                You&apos;ll find the code (like <span className="font-mono font-semibold">TRK-AB12CD34</span>)
                right after booking, and in <Link to="/my-parcels" className="font-semibold text-brand-600 hover:underline">My Parcels</Link>.
              </p>
            </div>
          )}

          {/* RESULT */}
          {!loading && parcel && (
            <div className="card overflow-hidden animate-fade-up">
              {/* HEADER */}
              <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div>
                  <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Tracking code</p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="font-mono text-2xl font-extrabold text-brand-700">
                      {parcel.tracking_code}
                    </p>
                    <button
                      type="button"
                      onClick={() => copy(parcel.tracking_code, "Tracking code copied")}
                      className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-white hover:text-brand-600"
                      aria-label="Copy tracking code"
                    >
                      {copied === parcel.tracking_code ? <FiCheck className="text-emerald-500" /> : <FiCopy />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={parcel.status} />
                  <button
                    type="button"
                    onClick={() => copy(shareLink, "Tracking link copied")}
                    className="btn btn-secondary btn-sm"
                  >
                    <FiLink size={14} /> Share link
                  </button>
                </div>
              </div>

              {/* TIMELINE */}
              <div className="border-b border-slate-100 p-6 sm:p-8">
                <StatusTimeline status={parcel.status} />
              </div>

              {/* DETAILS */}
              <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
                <Detail icon={FiBox} label="Parcel">
                  {parcel.title}
                  <span className="ml-2 text-sm font-medium text-slate-500">
                    {parcel.category} · {parcel.weight_kg} KG
                  </span>
                </Detail>

                <Detail icon={FiUser} label="Receiver">
                  {parcel.receiver_name}
                </Detail>

                <Detail icon={FiPhone} label="Receiver phone">
                  {maskPhone(parcel.receiver_phone)}
                </Detail>

                <Detail icon={FiMapPin} label="Destination">
                  {parcel.delivery_address}
                </Detail>
              </div>

              {/* FOOTER */}
              <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <span className="text-slate-500">
                  Booked on <span className="font-semibold text-slate-700">{formatDateTime(parcel.created_at)}</span>
                </span>
                <span className="text-slate-500">
                  Delivery charge <span className="text-lg font-extrabold text-slate-900">{formatBDT(parcel.delivery_charge)}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
