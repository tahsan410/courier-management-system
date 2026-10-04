import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiEye,
  FiHeart,
  FiShield,
  FiTarget,
  FiUsers,
  FiZap,
} from "react-icons/fi";

import PageHeader from "../components/PageHeader";
import useDocumentTitle from "../hooks/useDocumentTitle";

const VALUES = [
  {
    icon: FiShield,
    title: "Reliability",
    text: "Every parcel gets a unique code and a clear status, so nothing gets lost in the noise.",
  },
  {
    icon: FiEye,
    title: "Transparency",
    text: "You see the price before you book and the status after — no hidden charges, no guesswork.",
  },
  {
    icon: FiZap,
    title: "Speed & simplicity",
    text: "Booking takes under a minute. Tracking takes a single code. We remove the friction.",
  },
  {
    icon: FiHeart,
    title: "Care",
    text: "Behind every parcel is a person waiting for it. We treat each one that way.",
  },
];

const ROLES = [
  {
    icon: FiUsers,
    title: "For customers",
    points: [
      "Create an account and book parcels online",
      "See all your parcels and their live status",
      "Cancel a booking while it is still Pending",
      "Share a tracking code with your receiver",
    ],
  },
  {
    icon: FiTarget,
    title: "For delivery managers",
    points: [
      "View every parcel in one dashboard",
      "Search, filter by category and status, and sort",
      "Update delivery status as parcels move",
      "Remove invalid records when needed",
    ],
  },
];

export default function About() {
  useDocumentTitle("About us");

  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="We make parcel delivery simple, visible and dependable."
        subtitle="CourierExpress is a courier and logistics management platform that connects customers and delivery managers on a single, easy-to-use system."
      />

      {/* MISSION */}
      <section className="container-page py-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="eyebrow">Our mission</span>
            <h2 className="section-title mt-4">
              Take the stress out of sending a parcel
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              Sending something to someone you care about — or to a customer who
              is counting on you — should never be complicated. We built
              CourierExpress to give everyone a clear way to book a delivery,
              know exactly what it costs and follow it until it arrives.
            </p>
            <p className="mt-4 leading-relaxed text-slate-600">
              For delivery managers, the same platform provides the control
              needed to keep every parcel moving: one dashboard, powerful
              filters and quick status updates.
            </p>
            <Link to="/signup" className="btn btn-primary btn-lg mt-8">
              Join CourierExpress <FiArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="card p-5">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 font-bold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="bg-white py-16">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Built for two kinds of users</span>
            <h2 className="section-title mt-4">One platform, two experiences</h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {ROLES.map(({ icon: Icon, title, points }) => (
              <div key={title} className="card p-8">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                  <Icon size={24} />
                </span>
                <h3 className="mt-5 text-xl font-bold text-slate-900">{title}</h3>
                <ul className="mt-4 space-y-3">
                  {points.map((p) => (
                    <li key={p} className="flex gap-3 text-sm text-slate-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
