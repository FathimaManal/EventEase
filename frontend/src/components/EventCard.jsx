import { Link } from "react-router-dom";

import { formatDate } from "../utils/format";

export default function EventCard({ event }) {
  return (
    <Link to={`/events/${event.id}`} className="card flex flex-col gap-3 hover:border-brand-500 hover:shadow-md dark:hover:border-brand-500">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {event.title}
        </h3>
        {event.is_registered && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            Registered
          </span>
        )}
      </div>
      <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
        {event.description}
      </p>
      <div className="mt-auto flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
        <span>{formatDate(event.date)}</span>
        <span>{event.location}</span>
      </div>
    </Link>
  );
}
