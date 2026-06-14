import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { api, extractErrorMessage } from "../api/client";
import ErrorMessage from "../components/ErrorMessage";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/format";

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    api
      .get(`/events/${id}`)
      .then((res) => setEvent(res.data))
      .catch((err) => setError(extractErrorMessage(err, "Could not load this event.")))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleRegister = async () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/events/${id}` } } });
      return;
    }
    setSubmitting(true);
    setActionError("");
    setSuccess("");
    try {
      await api.post(`/events/${id}/register`);
      setSuccess("You're registered!");
      load();
    } catch (err) {
      setActionError(extractErrorMessage(err, "Could not register for this event."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner label="Loading event..." />;
  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ErrorMessage>{error}</ErrorMessage>
        <Link to="/" className="mt-4 inline-block text-sm text-brand-600 hover:underline dark:text-brand-500">
          ← Back to events
        </Link>
      </div>
    );
  }
  if (!event) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/" className="text-sm text-brand-600 hover:underline dark:text-brand-500">
        ← Back to events
      </Link>

      <div className="card mt-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {event.title}
          </h1>
          {event.is_registered && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              Registered
            </span>
          )}
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-500 dark:text-slate-400">Date</dt>
            <dd className="text-slate-900 dark:text-slate-100">{formatDate(event.date)}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500 dark:text-slate-400">Location</dt>
            <dd className="text-slate-900 dark:text-slate-100">{event.location}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500 dark:text-slate-400">Attendees</dt>
            <dd className="text-slate-900 dark:text-slate-100">{event.attendee_count}</dd>
          </div>
        </dl>

        <div className="mt-6">
          <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">About this event</h2>
          <p className="mt-2 whitespace-pre-line text-slate-800 dark:text-slate-200">
            {event.description}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {actionError && <ErrorMessage>{actionError}</ErrorMessage>}
          {success && (
            <div className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
              {success}
            </div>
          )}
          <button
            onClick={handleRegister}
            disabled={submitting || event.is_registered}
            className="btn-primary w-full sm:w-auto"
          >
            {event.is_registered
              ? "Already registered"
              : submitting
              ? "Registering..."
              : user
              ? "Register for this event"
              : "Sign in to register"}
          </button>
        </div>
      </div>
    </div>
  );
}
