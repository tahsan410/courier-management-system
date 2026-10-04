import { useEffect } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { Spinner } from "./Spinner";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Keep it",
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && !loading && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={() => !loading && onCancel()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lift animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-4">
          <span
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${
              danger ? "bg-rose-100 text-rose-600" : "bg-brand-100 text-brand-600"
            }`}
          >
            <FiAlertTriangle size={20} />
          </span>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
          <button
            className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Spinner size={16} />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
