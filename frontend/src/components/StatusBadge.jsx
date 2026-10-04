const STYLES = {
  Pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  "Picked Up": "bg-violet-50 text-violet-700 ring-violet-600/20",
  "In Transit": "bg-sky-50 text-sky-700 ring-sky-600/20",
  Delivered: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Cancelled: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

const DOTS = {
  Pending: "bg-amber-500",
  "Picked Up": "bg-violet-500",
  "In Transit": "bg-sky-500",
  Delivered: "bg-emerald-500",
  Cancelled: "bg-rose-500",
};

export default function StatusBadge({ status = "Pending", size = "md" }) {
  const style = STYLES[status] || STYLES.Pending;
  const dot = DOTS[status] || DOTS.Pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-semibold ring-1 ring-inset ${style} ${
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}
