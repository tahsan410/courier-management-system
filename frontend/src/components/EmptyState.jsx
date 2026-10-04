export default function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      {Icon && (
        <span className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <Icon size={28} />
        </span>
      )}
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      {text && <p className="mt-1.5 max-w-sm text-sm text-slate-500">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
