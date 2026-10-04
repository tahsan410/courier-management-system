export default function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <div className="relative overflow-hidden bg-ink">
      <div className="hero-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl" />
      <div className="container-page relative py-14 sm:py-16">
        {eyebrow && (
          <span className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-bold tracking-wider text-brand-200 uppercase">
            {eyebrow}
          </span>
        )}
        <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-300">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}
