import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiCopy,
  FiMapPin,
  FiMinus,
  FiPackage,
  FiPlus,
  FiUser,
} from "react-icons/fi";
import toast from "react-hot-toast";

import { api } from "../lib/api";
import useApiError from "../hooks/useApiError";
import useCopy from "../hooks/useCopy";
import useDocumentTitle from "../hooks/useDocumentTitle";
import PageHeader from "../components/PageHeader";
import { Spinner } from "../components/Spinner";
import {
  BASE_CHARGE,
  BD_PHONE_REGEX,
  CATEGORIES,
  PER_KG_CHARGE,
  calcCharge,
  formatBDT,
} from "../lib/constants";

const INITIAL = {
  title: "",
  receiver_name: "",
  receiver_phone: "",
  delivery_address: "",
  category: "Electronics",
  weight_kg: 1,
};

function SectionTitle({ icon: Icon, children }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
        <Icon size={17} />
      </span>
      <h2 className="text-lg font-bold text-slate-900">{children}</h2>
    </div>
  );
}

export default function BookParcel() {
  useDocumentTitle("Book a parcel");

  const handleApiError = useApiError();
  const { copied, copy } = useCopy();

  const [formData, setFormData] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(null);

  const charge = calcCharge(formData.weight_kg);
  const weightCharge = (Number(formData.weight_kg) || 0) * PER_KG_CHARGE;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "weight_kg" ? parseFloat(value) || 0 : value,
    }));
  };

  const stepWeight = (delta) =>
    setFormData((prev) => ({
      ...prev,
      weight_kg: Math.min(500, Math.max(0.5, +(Number(prev.weight_kg) + delta).toFixed(1))),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const payload = {
      ...formData,
      title: formData.title.trim(),
      receiver_name: formData.receiver_name.trim(),
      receiver_phone: formData.receiver_phone.trim().replace(/[\s-]/g, ""),
      delivery_address: formData.delivery_address.trim(),
    };

    if (!payload.title || !payload.receiver_name || !payload.delivery_address) {
      return toast.error("Please fill in all required fields.");
    }
    if (!BD_PHONE_REGEX.test(payload.receiver_phone)) {
      return toast.error("Enter a valid Bangladeshi phone number (e.g. 01XXXXXXXXX).");
    }
    if (payload.weight_kg <= 0) {
      return toast.error("Weight must be greater than 0.");
    }

    setLoading(true);

    try {
      const data = await api.bookParcel(payload);
      toast.success("Parcel booked successfully!");
      setBooked(data);
      setFormData(INITIAL);
    } catch (error) {
      handleApiError(error, "Failed to book parcel");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SUCCESS SCREEN ---------------- */
  if (booked) {
    return (
      <div className="container-page flex min-h-[75vh] items-center justify-center py-12">
        <div className="card w-full max-w-lg overflow-hidden text-center animate-pop">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-8 py-10 text-white">
            <FiCheckCircle className="mx-auto" size={54} />
            <h1 className="mt-4 text-2xl font-extrabold">Parcel booked!</h1>
            <p className="mt-1 text-emerald-50">
              Share the tracking code with your receiver.
            </p>
          </div>

          <div className="p-8">
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Tracking code
            </p>
            <div className="mt-2 flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50 px-5 py-4">
              <span className="font-mono text-2xl font-extrabold tracking-wide text-brand-700">
                {booked.tracking_code}
              </span>
              <button
                type="button"
                onClick={() => copy(booked.tracking_code, "Tracking code copied")}
                className="grid h-9 w-9 place-items-center rounded-lg bg-white text-brand-600 shadow-sm hover:bg-brand-100"
                aria-label="Copy tracking code"
              >
                {copied === booked.tracking_code ? <FiCheck className="text-emerald-500" /> : <FiCopy />}
              </button>
            </div>

            <dl className="mt-6 space-y-3 text-left text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Parcel</dt>
                <dd className="font-semibold text-slate-900">{booked.title}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Receiver</dt>
                <dd className="font-semibold text-slate-900">{booked.receiver_name}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-3">
                <dt className="text-slate-500">Delivery charge</dt>
                <dd className="text-lg font-extrabold text-slate-900">{formatBDT(booked.delivery_charge)}</dd>
              </div>
            </dl>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link to="/my-parcels" className="btn btn-primary">
                View my parcels
              </Link>
              <Link to={`/track?code=${encodeURIComponent(booked.tracking_code)}`} className="btn btn-secondary">
                Track this parcel
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setBooked(null)}
              className="mt-4 text-sm font-semibold text-brand-600 hover:underline"
            >
              + Book another parcel
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- FORM ---------------- */
  return (
    <>
      <PageHeader
        eyebrow="New booking"
        title="Book a new parcel"
        subtitle="Fill in the details below. Your delivery charge updates live as you enter the weight."
      />

      <form onSubmit={handleSubmit} className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {/* PARCEL */}
          <div className="card p-6 sm:p-8">
            <SectionTitle icon={FiPackage}>Parcel details</SectionTitle>

            <div className="space-y-5">
              <div>
                <label htmlFor="title" className="label">Parcel title / description</label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  required
                  disabled={loading}
                  className="input"
                  placeholder="e.g. Laptop, Important documents"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="category" className="label">Category</label>
                  <select
                    id="category"
                    name="category"
                    disabled={loading}
                    className="input"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="weight_kg" className="label">Weight (KG)</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => stepWeight(-0.5)}
                      className="btn btn-secondary h-[2.7rem] w-11 shrink-0 !p-0"
                      aria-label="Decrease weight"
                    >
                      <FiMinus />
                    </button>
                    <input
                      id="weight_kg"
                      type="number"
                      name="weight_kg"
                      min="0.5"
                      step="0.5"
                      required
                      disabled={loading}
                      className="input text-center font-bold"
                      value={formData.weight_kg}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => stepWeight(0.5)}
                      className="btn btn-secondary h-[2.7rem] w-11 shrink-0 !p-0"
                      aria-label="Increase weight"
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RECEIVER */}
          <div className="card p-6 sm:p-8">
            <SectionTitle icon={FiUser}>Receiver information</SectionTitle>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="receiver_name" className="label">Receiver name</label>
                <input
                  id="receiver_name"
                  type="text"
                  name="receiver_name"
                  required
                  disabled={loading}
                  className="input"
                  placeholder="Full name"
                  value={formData.receiver_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="receiver_phone" className="label">Receiver phone</label>
                <input
                  id="receiver_phone"
                  type="tel"
                  name="receiver_phone"
                  required
                  disabled={loading}
                  className="input"
                  placeholder="01XXXXXXXXX"
                  value={formData.receiver_phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* ADDRESS */}
          <div className="card p-6 sm:p-8">
            <SectionTitle icon={FiMapPin}>Delivery address</SectionTitle>

            <label htmlFor="delivery_address" className="label">Complete address</label>
            <textarea
              id="delivery_address"
              name="delivery_address"
              required
              rows={3}
              disabled={loading}
              className="input resize-y"
              placeholder="House, road, area, district"
              value={formData.delivery_address}
              onChange={handleChange}
            />
            <p className="hint">Include a landmark if possible — it helps the courier find the place faster.</p>
          </div>
        </div>

        {/* SUMMARY */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card overflow-hidden">
            <div className="bg-ink px-6 py-5">
              <h2 className="font-bold text-white">Order summary</h2>
            </div>

            <div className="space-y-4 p-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Category</span>
                  <span className="font-semibold text-slate-900">
                    {CATEGORIES.find((c) => c.value === formData.category)?.label}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Base charge</span>
                  <span className="font-semibold text-slate-900">{formatBDT(BASE_CHARGE)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>
                    Weight ({formData.weight_kg || 0} KG × ৳{PER_KG_CHARGE})
                  </span>
                  <span className="font-semibold text-slate-900">{formatBDT(weightCharge)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-brand-50 p-4">
                <span className="font-bold text-brand-900">Total</span>
                <span className="text-2xl font-extrabold text-brand-700">{formatBDT(charge)}</span>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                {loading ? (
                  <>
                    <Spinner size={18} /> Booking...
                  </>
                ) : (
                  <>
                    Confirm booking <FiArrowRight />
                  </>
                )}
              </button>

              <div className="flex gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                <FiAlertCircle className="mt-0.5 shrink-0" size={15} />
                You can cancel this booking from My Parcels while it is still Pending.
              </div>
            </div>
          </div>
        </aside>
      </form>
    </>
  );
}
