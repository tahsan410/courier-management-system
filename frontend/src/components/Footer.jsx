import { Link } from "react-router-dom";
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";

import Logo from "./Logo";
import { SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_PHONE_HREF } from "../lib/constants";

const COMPANY = [
  { to: "/about", label: "About Us" },
  { to: "/services", label: "Services" },
  { to: "/pricing", label: "Pricing" },
  { to: "/contact", label: "Contact & FAQ" },
];

const PLATFORM = [
  { to: "/track", label: "Track Parcel" },
  { to: "/book", label: "Book Parcel" },
  { to: "/my-parcels", label: "My Parcels" },
  { to: "/login", label: "Login" },
];

const linkCls = "text-sm text-slate-400 transition hover:text-white";

export default function Footer() {
  return (
    <footer className="bg-ink text-slate-300">
      <div className="container-page py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.4fr]">
          {/* BRAND */}
          <div>
            <Logo light />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Fast, reliable and secure parcel delivery management for
              customers and delivery managers across Bangladesh.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold tracking-wider text-white uppercase">
              Company
            </h3>
            <ul className="space-y-2.5">
              {COMPANY.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className={linkCls}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold tracking-wider text-white uppercase">
              Platform
            </h3>
            <ul className="space-y-2.5">
              {PLATFORM.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className={linkCls}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold tracking-wider text-white uppercase">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-3">
                <FiMail className="text-brand-400" />
                <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-white">
                  {SUPPORT_EMAIL}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="text-brand-400" />
                <a href={`tel:${SUPPORT_PHONE_HREF}`} className="hover:text-white">
                  {SUPPORT_PHONE}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FiMapPin className="text-brand-400" />
                Bangladesh
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm text-slate-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} CourierExpress. All rights reserved.
          </p>
          <p>Courier &amp; Logistics Management System</p>
        </div>
      </div>
    </footer>
  );
}
