import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCheck, FiMinus, FiPlus } from "react-icons/fi";

import PageHeader from "../components/PageHeader";
import FaqList from "../components/FaqList";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { FAQS } from "../lib/content";
import {
  BASE_CHARGE,
  PER_KG_CHARGE,
  calcCharge,
  formatBDT,
} from "../lib/constants";

const SAMPLE_WEIGHTS = [0.5, 1, 2, 5, 10, 20];

export default function Pricing() {
  useDocumentTitle("Pricing");

  const [weight, setWeight] = useState(1);

  const step = (delta) =>
    setWeight((w) => Math.min(100, Math.max(0.5, +(w + delta).toFixed(1))));

  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Simple pricing. No surprises."
        subtitle={`Every parcel costs a flat ৳${BASE_CHARGE} plus ৳${PER_KG_CHARGE} per kilogram — whatever the category.`}
      />

      <section className="container-page py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* CALCULATOR */}
          <div className="card p-7 sm:p-8">
            <h2 className="text-xl font-extrabold text-slate-900">Price calculator</h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter your parcel weight to see the exact delivery charge.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => step(-0.5)}
                className="btn btn-secondary h-12 w-12 !p-0"
                aria-label="Decrease weight"
              >
                <FiMinus />
              </button>
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="input h-12 text-center text-lg font-bold"
                  aria-label="Weight in KG"
                />
                <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  KG
                </span>
              </div>
              <button
                type="button"
                onClick={() => step(0.5)}
                className="btn btn-secondary h-12 w-12 !p-0"
                aria-label="Increase weight"
              >
                <FiPlus />
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white">
              <p className="text-sm text-brand-200">Total delivery charge</p>
              <p className="mt-1 text-4xl font-extrabold">{formatBDT(calcCharge(weight))}</p>
              <p className="mt-2 text-xs text-brand-200">
                ৳{BASE_CHARGE} base + {weight || 0} KG × ৳{PER_KG_CHARGE}
              </p>
            </div>

            <Link to="/book" className="btn btn-primary btn-lg mt-6 w-full">
              Book a parcel <FiArrowRight />
            </Link>
          </div>

          {/* TABLE */}
          <div className="card overflow-hidden">
            <div className="p-7 pb-4 sm:p-8 sm:pb-4">
              <h2 className="text-xl font-extrabold text-slate-900">Sample charges</h2>
              <p className="mt-1 text-sm text-slate-500">
                A quick reference for common parcel weights.
              </p>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="px-7 py-3 sm:px-8">Weight</th>
                  <th className="px-4 py-3">Calculation</th>
                  <th className="px-7 py-3 text-right sm:px-8">Charge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SAMPLE_WEIGHTS.map((w) => (
                  <tr key={w} className="hover:bg-slate-50">
                    <td className="px-7 py-3.5 font-bold text-slate-900 sm:px-8">{w} KG</td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {BASE_CHARGE} + {w} × {PER_KG_CHARGE}
                    </td>
                    <td className="px-7 py-3.5 text-right font-bold text-brand-600 sm:px-8">
                      {formatBDT(calcCharge(w))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* INCLUDED */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            "Tracking code with every booking",
            "Free cancellation while Pending",
            "Same rate for every category",
          ].map((t) => (
            <div
              key={t}
              className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-900"
            >
              <FiCheck className="shrink-0 text-emerald-600" size={18} />
              {t}
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-center text-2xl font-extrabold text-slate-900">
            Pricing questions
          </h2>
          <FaqList items={FAQS.slice(0, 3)} />
        </div>
      </section>
    </>
  );
}
