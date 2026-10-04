import { Link } from "react-router-dom";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";

import PageHeader from "../components/PageHeader";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { SERVICES } from "../lib/content";

const INCLUDED = [
  "Unique tracking code for every parcel",
  "Live status: Pending → Picked Up → In Transit → Delivered",
  "Receiver name, phone and full address recorded",
  "Instant, transparent delivery charge",
  "Cancel any time while the parcel is Pending",
  "Public tracking page you can share",
];

export default function Services() {
  useDocumentTitle("Services");

  return (
    <>
      <PageHeader
        eyebrow="Our services"
        title="Delivery solutions for every kind of parcel"
        subtitle="Choose the category that fits your shipment. Pricing is the same for all — simple, fair and based on weight."
      />

      <section className="container-page py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(({ icon: Icon, title, text, category }) => (
            <div key={title} className="card card-hover flex flex-col p-7">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/25">
                <Icon size={24} />
              </span>
              <h3 className="mt-5 text-xl font-bold text-slate-900">{title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{text}</p>
              {category && (
                <Link
                  to="/book"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:gap-3"
                >
                  Book as {category} <FiArrowRight />
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="eyebrow">Included with every parcel</span>
            <h2 className="section-title mt-4">Everything you need, built in</h2>
            <p className="section-sub">
              No add-ons to configure. Every booking comes with the full
              CourierExpress experience.
            </p>
            <Link to="/book" className="btn btn-primary btn-lg mt-8">
              Book a parcel <FiArrowRight />
            </Link>
          </div>

          <ul className="grid gap-3">
            {INCLUDED.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 font-medium text-slate-700"
              >
                <FiCheckCircle className="shrink-0 text-emerald-500" size={20} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
