import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiChevronDown,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiPackage,
  FiPlusCircle,
  FiX,
} from "react-icons/fi";

import useAuth from "../hooks/useAuth";
import Logo from "./Logo";

const PUBLIC_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/services", label: "Services" },
  { to: "/pricing", label: "Pricing" },
  { to: "/track", label: "Track Parcel" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-brand-50 text-brand-700"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  const isAdmin = user?.role === "admin";

  // shadow once page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close user dropdown on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const closeAll = () => {
    setMobileOpen(false);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    closeAll();
    logout();
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const accountLinks = isAdmin
    ? [{ to: "/admin", label: "Admin Dashboard", icon: FiGrid }]
    : [
        { to: "/book", label: "Book Parcel", icon: FiPlusCircle },
        { to: "/my-parcels", label: "My Parcels", icon: FiPackage },
      ];

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-white/85 backdrop-blur-xl transition-shadow ${
        scrolled ? "border-slate-200 shadow-sm" : "border-transparent"
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo onClick={closeAll} />

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {PUBLIC_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* DESKTOP ACTIONS */}
        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              {!isAdmin && (
                <Link to="/book" className="btn btn-primary btn-sm">
                  <FiPlusCircle size={15} /> Book Parcel
                </Link>
              )}

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pr-3 pl-1 transition hover:border-slate-300"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white uppercase">
                    {user.username?.[0]}
                  </span>
                  <span className="max-w-[110px] truncate text-sm font-semibold text-slate-800">
                    {user.username}
                  </span>
                  <FiChevronDown
                    size={15}
                    className={`text-slate-400 transition ${menuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lift animate-pop"
                  >
                    <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {user.username}
                      </p>
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${
                          isAdmin
                            ? "bg-amber-100 text-amber-700"
                            : "bg-brand-100 text-brand-700"
                        }`}
                      >
                        {isAdmin ? "Administrator" : "Customer"}
                      </span>
                    </div>

                    <div className="p-1.5">
                      {accountLinks.map(({ to, label, icon: Icon }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={closeAll}
                          role="menuitem"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        >
                          <Icon size={16} className="text-slate-400" />
                          {label}
                        </Link>
                      ))}
                      <button
                        type="button"
                        onClick={handleLogout}
                        role="menuitem"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
                      >
                        <FiLogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="grid h-10 w-10 place-items-center rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white animate-fade-in lg:hidden">
          <div className="container-page space-y-1 py-4">
            {PUBLIC_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={closeAll}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 text-sm font-semibold ${
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}

            <div className="my-3 border-t border-slate-100" />

            {user ? (
              <>
                <p className="px-4 pb-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                  Signed in as {user.username}
                </p>
                {accountLinks.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={closeAll}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Icon size={17} className="text-brand-600" />
                    {label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <FiLogOut size={17} />
                  Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Link to="/login" onClick={closeAll} className="btn btn-secondary">
                  Login
                </Link>
                <Link to="/signup" onClick={closeAll} className="btn btn-primary">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
