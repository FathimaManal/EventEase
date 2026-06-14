import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api, extractErrorMessage } from "../api/client";
import ErrorMessage from "../components/ErrorMessage";
import Spinner from "../components/Spinner";
import { formatDate } from "../utils/format";

export default function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/my-registrations")
      .then((res) => setRegistrations(res.data))
      .catch((err) => setError(extractErrorMessage(err, "Could not load your registrations.")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        My registrations
      </h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Events you've signed up for.
      </p>

      <div className="mt-6">
        {loading ? (
          <Spinner label="Loading your registrations..." />
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : registrations.length === 0 ? (
          <div className="card text-center text-sm text-slate-600 dark:text-slate-400">
            You haven't registered for any events yet.{" "}
            <Link to="/" className="font-medium text-brand-600 hover:underline dark:text-brand-500">
              Browse events
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {registrations.map((r) => (
              <li key={r.id}>
                <Link to={`/events/${r.event.id}`} className="card flex flex-col gap-2 hover:border-brand-500 dark:hover:border-brand-500">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {r.event.title}
                    </h2>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Registered {formatDate(r.registered_at)}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {formatDate(r.event.date)} · {r.event.location}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
