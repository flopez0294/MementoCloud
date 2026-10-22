"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  CalendarDays,
  Cloud,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  X,
} from "lucide-react";
import type { CreateEventData } from "@/lib/events";

type CreateEventPopUpProps = {
  onClose: () => void;
  onCreate: (data: CreateEventData) => Promise<void>;
};

export default function CreateEventPopUp({
  onClose,
  onCreate,
}: CreateEventPopUpProps) {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const today = new Date();
  const minDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose, isSubmitting]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedName = eventName.trim();

    if (!trimmedName) {
      setError("Please enter an event name.");
      return;
    }

    if (password.length < 8) {
      setError("Your event password must be at least 6 characters.");
      return;
    }

    if (!timezone) {
      setError("Unable to determine your timezone.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreate({
        event_name: trimmedName,
        event_date: eventDate,
        timezone,
        password,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your event. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#302820]/40 px-4 py-8 backdrop-blur-md"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !isSubmitting
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-event-title"
        className="relative my-auto w-full max-w-lg rounded-3xl border border-[#c9c1b8]/60 bg-[#f5f0e8] p-6 shadow-2xl sm:p-9"
      >
        <div className="mb-7">
          <div className="mb-12 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-2xl font-medium tracking-tight">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2">
                <Cloud />
              </span>
              MementoCloud
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close create event dialog"
              className="rounded-full p-2 text-[#54483f]/70 transition hover:bg-[#c9c1b8]/40 hover:text-[#54483f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          <p className="mb-2 text-sm font-medium tracking-wide text-[#5f6f62]">
            A new collection of memories
          </p>

          <h2
            id="create-event-title"
            className="text-3xl font-semibold tracking-tight text-[#54483f] sm:text-4xl"
          >
            Create your event
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#54483f]/70">
            Bring everyone&apos;s photos and videos together in one
            private place.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="event-name"
              className="mb-2 block text-sm font-medium text-[#54483f]"
            >
              Event name
            </label>

            <input
              id="event-name"
              type="text"
              value={eventName}
              onChange={(event) => setEventName(event.target.value)}
              placeholder="e.g. Alondra's Wedding"
              maxLength={100}
              required
              autoFocus
              className="w-full rounded-xl border border-[#c9c1b8] bg-white/70 px-4 py-3 text-[#54483f] outline-none transition placeholder:text-[#54483f]/40 focus:border-[#5f6f62] focus:ring-2 focus:ring-[#5f6f62]/20"
            />
          </div>

          <div>
            <label
              htmlFor="event-date"
              className="mb-2 block text-sm font-medium text-[#54483f]"
            >
              Event date
            </label>

            <div className="relative">
              <CalendarDays
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5f6f62]"
              />

              <input
                id="event-date"
                type="date"
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
                min={minDate}
                required
                className="w-full rounded-xl border border-[#c9c1b8] bg-white/70 py-3 pl-11 pr-4 text-[#54483f] outline-none transition focus:border-[#5f6f62] focus:ring-2 focus:ring-[#5f6f62]/20"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="event-password"
              className="mb-2 block text-sm font-medium text-[#54483f]"
            >
              Event password
            </label>

            <div className="relative">
              <LockKeyhole
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5f6f62]"
              />

              <input
                id="event-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create a password for your guests"
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                required
                className="w-full rounded-xl border border-[#c9c1b8] bg-white/70 py-3 pl-11 pr-12 text-[#54483f] outline-none transition placeholder:text-[#54483f]/40 focus:border-[#5f6f62] focus:ring-2 focus:ring-[#5f6f62]/20"
              />

              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#54483f]/60 transition hover:bg-[#c9c1b8]/30 hover:text-[#54483f]"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            <p className="mt-2 text-xs leading-5 text-[#54483f]/60">
              Guests will use this password to access the event album.
              Use at least 8 characters.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-[#c9c1b8] px-5 py-3 text-sm font-medium text-[#54483f] transition hover:bg-[#c9c1b8]/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5f6f62] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#4d5b50] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  Creating event...
                </>
              ) : (
                "Create event"
              )}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-[#54483f]/50">
          Your memories, shared privately.
        </p>
      </div>
    </div>
  );
}
