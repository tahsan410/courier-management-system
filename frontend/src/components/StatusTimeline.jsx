import { FiBox, FiCheck, FiTruck, FiPackage, FiXCircle } from "react-icons/fi";
import { JOURNEY } from "../lib/constants";

const STEPS = {
  Pending: { icon: FiBox, text: "Booking received" },
  "Picked Up": { icon: FiPackage, text: "Collected by courier" },
  "In Transit": { icon: FiTruck, text: "On the way to destination" },
  Delivered: { icon: FiCheck, text: "Delivered to receiver" },
};

export default function StatusTimeline({ status }) {
  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
        <FiXCircle size={22} className="shrink-0" />
        <div>
          <p className="font-bold">This parcel was cancelled</p>
          <p className="text-sm text-rose-600/80">
            No further delivery updates will be made.
          </p>
        </div>
      </div>
    );
  }

  const current = Math.max(JOURNEY.indexOf(status), 0);

  return (
    <ol className="grid gap-5 sm:grid-cols-4 sm:gap-0">
      {JOURNEY.map((step, i) => {
        const { icon: Icon, text } = STEPS[step];
        const done = i < current;
        const active = i === current;
        const reached = done || active;
        const last = i === JOURNEY.length - 1;
        // The final stage is a completed state, not "in progress"
        const finished = active && last;

        return (
          <li
            key={step}
            className="relative flex gap-4 sm:flex-col sm:items-center sm:gap-0 sm:text-center"
          >
            {/* connector */}
            {!last && (
              <>
                <span
                  className={`absolute top-10 left-5 h-[calc(100%-0.5rem)] w-0.5 sm:hidden ${
                    done ? "bg-brand-500" : "bg-slate-200"
                  }`}
                />
                <span
                  className={`absolute top-5 left-1/2 hidden h-0.5 w-full sm:block ${
                    done ? "bg-brand-500" : "bg-slate-200"
                  }`}
                />
              </>
            )}

            <span
              className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full ring-4 transition ${
                finished
                  ? "bg-emerald-500 text-white ring-emerald-100"
                  : active
                  ? "bg-brand-600 text-white ring-brand-100"
                  : done
                  ? "bg-brand-500 text-white ring-white"
                  : "bg-slate-100 text-slate-400 ring-white"
              }`}
            >
              {done ? <FiCheck size={18} /> : <Icon size={17} />}
              {active && !finished && (
                <span className="absolute inset-0 animate-ping rounded-full bg-brand-500/30" />
              )}
            </span>

            <div className="sm:mt-3">
              <p
                className={`text-sm font-bold ${
                  reached ? "text-slate-900" : "text-slate-400"
                }`}
              >
                {step}
              </p>
              <p
                className={`text-xs ${
                  reached ? "text-slate-500" : "text-slate-400"
                }`}
              >
                {text}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
