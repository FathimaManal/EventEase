import { useEffect, useState } from "react";

import { api, extractErrorMessage } from "../api/client";
import EventCard from "../components/EventCard";
import ErrorMessage from "../components/ErrorMessage";
import Spinner from "../components/Spinner";

export default function EventsPage() {
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .get("/events", { params: { page, search: search || undefined } })
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err, "Could not load events."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, search]);

  const totalPages = Math.max(1, Math.ceil(data.count / 9));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Upcoming events
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Browse and register for events you're interested in.
          </p>
        </div>
        <div className="sm:w-72">
          <input
            type="search"
            placeholder="Search by title, description, location"
            className="input"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="mb-4"><ErrorMessage>{error}</ErrorMessage></div>}

      {loading ? (
        <Spinner label="Loading events..." />
      ) : data.results.length === 0 ? (
        <div className="card text-center text-sm text-slate-600 dark:text-slate-400">
          No events match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.results.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {data.count > 9 && (
        <div className="mt-8 flex items-center justify-between text-sm">
          <button
            className="btn-secondary"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!data.previous || loading}
          >
            Previous
          </button>
          <span className="text-slate-600 dark:text-slate-400">
            Page {page} of {totalPages}
          </span>
          <button
            className="btn-secondary"
            onClick={() => setPage((p) => p + 1)}
            disabled={!data.next || loading}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
