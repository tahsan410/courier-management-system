import { Link } from "react-router-dom";
import { FiPackage } from "react-icons/fi";

export default function Logo({ light = false, onClick }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className="group flex items-center gap-2.5"
      aria-label="CourierExpress home"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/30 transition group-hover:scale-105">
        <FiPackage size={18} />
      </span>
      <span
        className={`text-lg font-extrabold tracking-tight ${
          light ? "text-white" : "text-slate-900"
        }`}
      >
        Courier<span className="text-brand-500">Express</span>
      </span>
    </Link>
  );
}
