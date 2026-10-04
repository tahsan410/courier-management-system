import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiCheck,
  FiClock,
  FiDollarSign,
  FiLock,
  FiMapPin,
  FiPackage,
  FiSearch,
  FiSmartphone,
  FiTruck,
} from "react-icons/fi";

import useAuth from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import FaqList from "../components/FaqList";
import StatusBadge from "../components/StatusBadge";
import { FAQS, SERVICES, STEPS } from "../lib/content";
import {
  BASE_CHARGE,
  PER_KG_CHARGE,
  calcCharge,
  formatBDT,
} from "../lib/constants";

/* ---------------------------------------------------------
   HERO
--------------------------------------------------------- */
function Hero() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [code, setCode] = useState("");

  const goTrack = (e) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    navigate(c ? `/track?code=${encodeURIComponent(c)}` : "/track");
  };

  return (
    <section className="relative overflow-hidden bg-ink">
      <div className="hero-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-brand-600/35 blur-3xl" />
      <div className="pointer-events-none absolute right-0 -bottom-40 h-[26rem] w-[26rem] rounded-full bg-accent-500/15 blur-3xl" />

      <div className="container-page relative grid items-center gap-14 py-16 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:py-28">
        {/* COPY */}
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-brand-200 backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Courier &amp; Logistics Management
          </span>

          <h1 className="mt-6 text-4xl leading-[1.08] font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Send parcels with{" "}
            <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-accent-400 bg-clip-text text-transparent">
              confidence
            </span>
            , track them in real time.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
            Book, track and manage your package deliveries seamlessly across the
            country — simple pricing, instant tracking codes and live status
            updates.
          </p>

          {/* TRACK BOX */}
          <form
            onSubmit={goTrack}
            className="mt-8 flex max-w-xl flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur sm:flex-row"
          >
            <div className="relative flex-1">
              <FiSearch className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter tracking code  e.g. TRK-AB12CD34"
                aria-label="Tracking code"
                className="w-full rounded-xl bg-transparent py-3.5 pr-4 pl-11 font-mono text-sm text-white uppercase placeholder:font-sans placeholder:text-slate-400 placeholder:normal-case focus:outline-none"
              />
            </div>
            <button type="submit" className="btn btn-accent px-7 py-3.5">
              Track parcel
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-300">
            <Link
              to={user ? (user.role === "admin" ? "/admin" : "/book") : "/signup"}
              className="inline-flex items-center gap-2 font-semibold text-white hover:text-brand-300"
            >
              {user
                ? user.role === "admin"
                  ? "Open dashboard"
                  : "Book a parcel"
                : "Create free account"}
              <FiArrowRight />
            </Link>
            <span className="inline-flex items-center gap-2">
              <FiCheck className="text-emerald-400" /> No hidden fees
            </span>
            <span className="inline-flex items-center gap-2">
              <FiCheck className="text-emerald-400" /> Public tracking
            </span>
          </div>
        </div>

        {/* VISUAL */}
        <div className="relative mx-auto hidden w-full max-w-md lg:block">
          <div className="animate-float rounded-3xl border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  Tracking code
                </p>
                <p className="mt-1 font-mono text-xl font-bold text-white">
                  TRK-8F2K9XQ1
                </p>
              </div>
              <StatusBadge status="In Transit" />
            </div>

            <div className="mt-6 space-y-5">
              {[
                { label: "Booking received", done: true },
                { label: "Collected by courier", done: true },
                { label: "On the way to destination", active: true },
                { label: "Delivered to receiver" },
              ].map((s, i, arr) => (
                <div key={s.label} className="relative flex items-center gap-4">
                  {i < arr.length - 1 && (
                    <span
                      className={`absolute top-8 left-[15px] h-5 w-0.5 ${
                        s.done ? "bg-brand-400" : "bg-white/15"
                      }`}
                    />
                  )}
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                      s.done
                        ? "bg-brand-500 text-white"
                        : s.active
                        ? "bg-accent-500 text-ink ring-4 ring-accent-500/25"
                        : "bg-white/10 text-slate-500"
                    }`}
                  >
                    {s.done ? <FiCheck size={16} /> : s.active ? <FiTruck size={15} /> : <FiMapPin size={14} />}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      s.done || s.active ? "text-white" : "text-slate-500"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between rounded-2xl bg-white/5 p-4">
              <div>
                <p className="text-xs text-slate-400">Delivery charge</p>
                <p className="text-lg font-bold text-white">{formatBDT(calcCharge(2))}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Weight</p>
                <p className="text-lg font-bold text-white">2 KG</p>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-6 -left-8 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
              <FiCheck size={20} />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">Status updated</p>
              <p className="text-xs text-slate-500">Parcel picked up by courier</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   HIGHLIGHT STRIP (all values are real platform facts)
--------------------------------------------------------- */
function Highlights() {
  const items = [
    { icon: FiDollarSign, value: `৳${BASE_CHARGE}`, label: "Flat base charge" },
    { icon: FiPackage, value: `৳${PER_KG_CHARGE} / KG`, label: "Simple weight pricing" },
    { icon: FiClock, value: "24/7", label: "Online tracking access" },
    { icon: FiLock, value: "Secure", label: "Encrypted login & sessions" },
  ];

  return (
    <section className="relative z-10 -mt-1 border-b border-slate-200 bg-white">
      <div className="container-page grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
        {items.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <Icon size={22} />
            </span>
            <div>
              <p className="text-xl font-extrabold text-slate-900">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   SERVICES
--------------------------------------------------------- */
function ServicesSection() {
  return (
    <section className="container-page py-20">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <span className="eyebrow">What we deliver</span>
          <h2 className="section-title mt-4">One platform, every kind of parcel</h2>
          <p className="section-sub">
            From important documents to everyday goods — choose a category and
            we handle the rest.
          </p>
        </div>
        <Link to="/services" className="btn btn-secondary shrink-0">
          All services <FiArrowRight />
        </Link>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card card-hover group p-7">
            <span className="grid h-13 w-13 place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 transition group-hover:from-brand-600 group-hover:to-brand-700 group-hover:text-white">
              <Icon size={24} />
            </span>
            <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   HOW IT WORKS
--------------------------------------------------------- */
function HowItWorks() {
  return (
    <section className="bg-white py-20">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">How it works</span>
          <h2 className="section-title mt-4">Four simple steps</h2>
          <p className="section-sub mx-auto">
            From booking to doorstep — no paperwork, no phone calls.
          </p>
        </div>

        <div className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute top-7 right-[12%] left-[12%] hidden h-0.5 bg-gradient-to-r from-brand-200 via-brand-300 to-brand-200 lg:block" />
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative text-center">
              <span className="relative z-10 mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-xl font-extrabold text-white shadow-lg shadow-brand-600/30">
                {i + 1}
              </span>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed text-slate-600">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   PRICE CALCULATOR
--------------------------------------------------------- */
function CalculatorSection() {
  const [weight, setWeight] = useState(2);
  const total = calcCharge(weight);

  return (
    <section className="container-page py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="eyebrow">Transparent pricing</span>
          <h2 className="section-title mt-4">Know the price before you book</h2>
          <p className="section-sub">
            A flat ৳{BASE_CHARGE} base charge plus ৳{PER_KG_CHARGE} for every
            kilogram. No surprises, no hidden fees.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Same pricing for every category",
              "Charge shown before you confirm",
              "Pay-as-you-ship — no subscription",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3 text-slate-700">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                  <FiCheck size={14} />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <Link to="/pricing" className="btn btn-secondary mt-8">
            View full pricing <FiArrowRight />
          </Link>
        </div>

        <div className="card p-7 sm:p-8">
          <div className="flex items-end justify-between">
            <label htmlFor="calc-weight" className="text-sm font-bold text-slate-700">
              Parcel weight
            </label>
            <span className="text-3xl font-extrabold text-brand-600">
              {weight} <span className="text-base font-bold text-slate-400">KG</span>
            </span>
          </div>

          <input
            id="calc-weight"
            type="range"
            min="0.5"
            max="20"
            step="0.5"
            value={weight}
            onChange={(e) => setWeight(parseFloat(e.target.value))}
            className="mt-5 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-600"
          />
          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>0.5 KG</span>
            <span>20 KG</span>
          </div>

          <div className="mt-8 space-y-3 rounded-2xl bg-slate-50 p-5 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Base charge</span>
              <span className="font-semibold">{formatBDT(BASE_CHARGE)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>
                Weight ({weight} KG × ৳{PER_KG_CHARGE})
              </span>
              <span className="font-semibold">{formatBDT(weight * PER_KG_CHARGE)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <span className="font-bold text-slate-900">Total</span>
              <span className="text-2xl font-extrabold text-slate-900">{formatBDT(total)}</span>
            </div>
          </div>

          <Link to="/book" className="btn btn-primary btn-lg mt-6 w-full">
            Book this parcel <FiArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   WHY US
--------------------------------------------------------- */
function WhyUs() {
  const items = [
    {
      icon: FiSearch,
      title: "Instant public tracking",
      text: "Anyone with the tracking code can check the status — no account needed.",
    },
    {
      icon: FiSmartphone,
      title: "Works on every device",
      text: "A fully responsive experience on phones, tablets and desktops.",
    },
    {
      icon: FiLock,
      title: "Secure by design",
      text: "Passwords are hashed and every private action requires a verified session.",
    },
    {
      icon: FiTruck,
      title: "Built for managers too",
      text: "Search, filter, sort and update every parcel from a powerful admin dashboard.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-ink py-20">
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="container-page relative">
        <div className="max-w-2xl">
          <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-bold tracking-wider text-brand-200 uppercase">
            Why CourierExpress
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Everything you need to ship with peace of mind
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:bg-white/[0.08]"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/20 text-brand-300">
                <Icon size={22} />
              </span>
              <h3 className="mt-5 font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   FAQ + CTA
--------------------------------------------------------- */
function FaqSection() {
  return (
    <section className="container-page py-20">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <span className="eyebrow">FAQ</span>
          <h2 className="section-title mt-4">Questions? We have answers.</h2>
          <p className="section-sub">
            Can&apos;t find what you&apos;re looking for? Reach out and our team
            will help you out.
          </p>
          <Link to="/contact" className="btn btn-secondary mt-6">
            Contact support <FiArrowRight />
          </Link>
        </div>
        <FaqList items={FAQS} />
      </div>
    </section>
  );
}

function CtaBanner() {
  const { user } = useAuth();

  return (
    <section className="container-page pb-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 px-6 py-14 text-center sm:px-12">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-accent-500/20 blur-2xl" />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ready to send your first parcel?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            Create an account in under a minute and get your tracking code
            instantly.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to={user ? (user.role === "admin" ? "/admin" : "/book") : "/signup"}
              className="btn btn-accent btn-lg"
            >
              {user ? (user.role === "admin" ? "Open dashboard" : "Book a parcel") : "Get started free"}
              <FiArrowRight />
            </Link>
            <Link to="/track" className="btn btn-outline-light btn-lg">
              Track a parcel
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  useDocumentTitle("");

  return (
    <>
      <Hero />
      <Highlights />
      <ServicesSection />
      <HowItWorks />
      <CalculatorSection />
      <WhyUs />
      <FaqSection />
      <CtaBanner />
    </>
  );
}
