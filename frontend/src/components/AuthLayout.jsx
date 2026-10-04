import { FiCheckCircle } from "react-icons/fi";
import Logo from "./Logo";

const POINTS = [
  "Book a parcel in under a minute",
  "Track every delivery with a single code",
  "Transparent pricing — no hidden fees",
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[1.05fr_1fr]">
      {/* BRAND PANEL */}
      <aside className="relative hidden overflow-hidden bg-ink lg:block">
        <div className="hero-grid absolute inset-0" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-brand-600/40 blur-3xl" />
        <div className="absolute top-10 right-0 h-64 w-64 rounded-full bg-accent-500/20 blur-3xl" />

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <Logo light />

          <div>
            <h2 className="max-w-md text-4xl leading-tight font-extrabold tracking-tight text-white">
              Deliveries that move as fast as your business.
            </h2>
            <ul className="mt-8 space-y-4">
              {POINTS.map((p) => (
                <li key={p} className="flex items-center gap-3 text-slate-300">
                  <FiCheckCircle className="shrink-0 text-accent-400" size={20} />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} CourierExpress
          </p>
        </div>
      </aside>

      {/* FORM */}
      <section className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md animate-fade-up">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-slate-500">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && (
            <p className="mt-6 text-center text-sm text-slate-600">{footer}</p>
          )}
        </div>
      </section>
    </div>
  );
}
