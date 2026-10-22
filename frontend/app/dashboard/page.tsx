
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import CreateEventPopUp from "@/components/CreateEventPopUp";
import {
  createEvent,
  getEvents,
  type CreateEventData,
  type Event,
} from "@/lib/events";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Cloud,
  Image as ImageIcon,
  Lock,
  LogOut,
  Menu,
  Plus,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

function formatEventDate(value: string) {
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );
}

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel = "View all",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.25em] text-[#5f6f62]">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-normal tracking-[-0.04em] sm:text-3xl">
          {title}
        </h2>
      </div>

      {href && (
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1.5 pb-1 text-sm text-[#5f6f62] transition hover:gap-2.5"
        >
          {linkLabel}
          <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { logout } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createPopUpOpen, setCreatePopUpOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      setLoading(true);
      setError(null);

      try {
        const data = await getEvents();

        if (!cancelled) {
          setEvents(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your events.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadEvents();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const today = getTodayDate();

  const sortedEvents = useMemo(
    () =>
      [...events].sort((a, b) => {
        const dateA = a.event_date.slice(0, 10);
        const dateB = b.event_date.slice(0, 10);

        const aIsUpcoming = dateA >= today;
        const bIsUpcoming = dateB >= today;

        // Upcoming events first, nearest date at the top.
        if (aIsUpcoming !== bIsUpcoming) {
          return aIsUpcoming ? -1 : 1;
        }

        // Upcoming: earliest to latest.
        // Past: most recent to oldest.
        return aIsUpcoming
          ? dateA.localeCompare(dateB)
          : dateB.localeCompare(dateA);
      }),
    [events, today],
  );

  const upcomingCount = events.filter(
    (event) => event.event_date.slice(0, 10) >= today,
  ).length;

  const pastCount = events.length - upcomingCount;

  const navigation = [
    { label: "Overview", href: "/dashboard", icon: Cloud },
  ];

  async function handleCreateEvent(data: CreateEventData) {
    const event = await createEvent(data);

    setCreatePopUpOpen(false);
    router.push(`/dashboard/events/${event.search_id}`);
  }

  return (
    <main className="min-h-screen bg-[#f5f0e8] text-[#3f3934]">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-[#3f3934]/30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#54483f]/10 bg-[#faf7f1] px-6 py-7 transition-transform duration-300 lg:w-64 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-12 flex items-center justify-between">
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2.5 text-2xl font-medium tracking-tight"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2">
              <Cloud />
            </span>
            MementoCloud
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
            className="rounded-full p-2 transition hover:bg-[#c9c1b8]/30 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <p className="mb-4 px-3 text-[10px] font-medium uppercase tracking-[0.25em] text-[#54483f]/45">
          Workspace
        </p>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/dashboard";

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm transition ${
                  active
                    ? "bg-[#5f6f62] text-[#f5f0e8]"
                    : "text-[#54483f]/65 hover:bg-[#c9c1b8]/25 hover:text-[#3f3934]"
                }`}
              >
                <Icon size={17} strokeWidth={1.7} />
                {item.label}

                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#f5f0e8]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-[#54483f]/10 pt-6">
          <button
            type="button"
            onClick={() => void logout()}
            className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm text-[#54483f]/60 transition hover:bg-red-50 hover:text-red-700"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main page */}
      <div className="min-w-0 lg:pl-64">
        <header className="sticky top-0 z-30 flex min-h-[76px] items-center justify-between border-b border-[#54483f]/10 bg-[#f5f0e8]/90 px-5 backdrop-blur-md sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
              className="rounded-full p-2 transition hover:bg-[#c9c1b8]/30 lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#54483f]/45">
                Workspace / Overview
              </p>
              <p className="mt-1 text-sm font-medium">Your dashboard</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCreatePopUpOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#5f6f62] px-4 py-2.5 text-sm font-medium text-[#f5f0e8] transition hover:-translate-y-0.5 hover:bg-[#4f6053]"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Create event</span>
          </button>
        </header>

        <div className="mx-auto max-w-[1440px] px-5 py-9 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
          {/* Welcome */}
          <section className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end lg:mb-16">
            <div className="max-w-2xl">
              <p className="mb-5 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-[#5f6f62]">
                <Sparkles size={14} />
                Your moments. Forever.
              </p>

              <h1 className="text-5xl font-normal leading-[0.95] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                Welcome back.
                <br />
                <span className="text-[#5f6f62]">
                  Let&apos;s make memories.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-sm leading-7 text-[#54483f]/65 sm:text-base">
                All your special gatherings, in one place. Create an event,
                invite your people, and keep every moment together.
              </p>
            </div>
          </section>

          {/* Event list */}
          <section className="mb-16">
            <SectionHeading
              eyebrow="Your collection"
              title="A place for every memory."
              href="/dashboard/events"
              linkLabel="All events"
            />

            {loading ? (
              <div
                className="divide-y divide-[#54483f]/10 border-y border-[#54483f]/10"
                aria-label="Loading albums"
                aria-live="polite"
              >
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex animate-pulse items-center gap-5 py-5"
                  >
                    <div className="h-14 w-14 shrink-0 rounded-full bg-[#c9c1b8]/40" />
                    <div className="flex-1">
                      <div className="h-4 w-1/3 bg-[#c9c1b8]/40" />
                      <div className="mt-3 h-3 w-1/4 bg-[#c9c1b8]/30" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div
                role="alert"
                className="border border-[#54483f]/15 bg-[#faf7f1] p-6"
              >
                <p className="text-base font-medium">
                  We couldn&apos;t load your albums.
                </p>

                <p className="mt-2 text-sm leading-6 text-[#54483f]/60">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => setRefreshKey((key) => key + 1)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#5f6f62] px-5 py-2.5 text-sm text-white transition hover:bg-[#4f6053]"
                >
                  Try again <ArrowRight size={15} />
                </button>
              </div>
            ) : events.length === 0 ? (
              <div className="border border-dashed border-[#54483f]/20 bg-[#faf7f1] px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e6e6dc] text-[#5f6f62]">
                  <ImageIcon size={24} />
                </div>

                <h3 className="mt-5 text-2xl font-normal tracking-tight">
                  Your collection starts here.
                </h3>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#54483f]/60">
                  Create your first event album and invite your guests to
                  share their photos and videos.
                </p>

                <button
                  type="button"
                  onClick={() => setCreatePopUpOpen(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#5f6f62] px-6 py-3 text-sm text-[#f5f0e8] transition hover:-translate-y-0.5 hover:bg-[#4f6053]"
                >
                  Create your first event <ArrowRight size={15} />
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#54483f]/15 border-y border-[#54483f]/15">
                {sortedEvents.map((event) => {
                  const upcoming = event.event_date.slice(0, 10) >= today;

                  return (
                    <Link
                      key={event.id}
                      href={`/dashboard/events/${event.search_id}`}
                      className="group flex flex-col gap-4 py-5 transition-colors hover:bg-[#faf7f1]/70 sm:flex-row sm:items-center sm:gap-6 sm:px-4"
                    >
                      {/* Event icon */}
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e6e4d9] text-[#5f6f62] transition-colors group-hover:bg-[#dce0d5]">
                        <ImageIcon size={23} strokeWidth={1.4} />
                      </div>

                      {/* Event name and date */}
                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-lg font-medium tracking-tight text-[#3f3934] transition-colors group-hover:text-[#5f6f62]">
                          {event.event_name}
                        </h3>

                        <p className="mt-1 flex items-center gap-2 text-sm text-[#54483f]/60">
                          <CalendarDays size={14} />
                          {formatEventDate(event.event_date)}
                        </p>
                      </div>

                      {/* Status and privacy */}
                      <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] ${
                            upcoming
                              ? "bg-[#e2e5db] text-[#5f6f62]"
                              : "bg-[#e6e4d9] text-[#54483f]/60"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              upcoming
                                ? "bg-[#5f6f62]"
                                : "bg-[#9b9a86]"
                            }`}
                          />
                          {upcoming ? "Upcoming" : "Past event"}
                        </span>

                        <span className="inline-flex items-center gap-1.5 text-xs text-[#54483f]/50">
                          <Lock size={13} />
                          Private
                        </span>
                      </div>

                      {/* Open album */}
                      <div className="flex shrink-0 items-center gap-2 text-sm font-medium text-[#5f6f62] transition-all group-hover:gap-3">
                        Open album
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#54483f]/15 transition-colors group-hover:border-[#5f6f62] group-hover:bg-[#5f6f62] group-hover:text-[#f5f0e8]">
                          <ChevronRight size={17} />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Create album callout */}
          {!loading && !error && events.length > 0 && (
            <section className="relative mb-16 overflow-hidden bg-[#e6e4d9] px-6 py-10 sm:px-10 sm:py-12">
              <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full border border-[#5f6f62]/20 sm:right-12 sm:h-72 sm:w-72" />
              <div className="absolute -right-3 -top-9 h-40 w-40 rounded-full border border-[#5f6f62]/20 sm:right-20 sm:h-56 sm:w-56" />

              <div className="relative z-10 max-w-xl">
                <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-[#5f6f62]">
                  Something worth remembering?
                </p>

                <h2 className="text-3xl font-normal leading-tight tracking-[-0.04em] sm:text-4xl">
                  Every gathering deserves its own album.
                </h2>

                <p className="mt-4 max-w-md text-sm leading-6 text-[#54483f]/60">
                  Start a new event and bring everyone&apos;s photos together
                  in one private space.
                </p>

                <button
                  type="button"
                  onClick={() => setCreatePopUpOpen(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#5f6f62] px-6 py-3 text-sm font-medium text-[#f5f0e8] transition hover:-translate-y-0.5 hover:bg-[#4f6053]"
                >
                  Create an event <ArrowRight size={15} />
                </button>
              </div>
            </section>
          )}

          {/* Privacy and retention */}
          <section className="grid gap-8 border-t border-[#54483f]/15 py-10 md:grid-cols-2 md:gap-12">
            <div>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#e2e5db] text-[#5f6f62]">
                <ShieldCheck size={20} />
              </div>

              <h3 className="text-xl font-normal tracking-tight">
                Your memories stay private.
              </h3>

              <p className="mt-3 max-w-md text-sm leading-6 text-[#54483f]/60">
                Guests can use your event link and password to contribute
                without needing to create an account.
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs text-[#5f6f62]">
                <Check size={14} />
                Private event access
              </div>
            </div>

            <div>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#e9e0d2] text-[#8b7254]">
                <Clock3 size={20} />
              </div>

              <h3 className="text-xl font-normal tracking-tight">
                Remember to save what matters.
              </h3>

              <p className="mt-3 max-w-md text-sm leading-6 text-[#54483f]/60">
                MementoCloud albums are temporary. Download the memories
                you want to keep before the album&apos;s retention period ends.
              </p>

              <Link
                href="/dashboard/events"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#5f6f62] transition hover:gap-2.5"
              >
                Review your events <ArrowRight size={15} />
              </Link>
            </div>
          </section>

          <footer className="border-t border-[#54483f]/15 pt-6 text-xs text-[#54483f]/45">
            MementoCloud
          </footer>
        </div>
      </div>

      {createPopUpOpen && (
        <CreateEventPopUp
          onClose={() => setCreatePopUpOpen(false)}
          onCreate={handleCreateEvent}
        />
      )}
    </main>
  );
}
