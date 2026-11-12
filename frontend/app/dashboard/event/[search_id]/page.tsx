"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import useMediaQuery from "@mui/material/useMediaQuery";
import JSZip from "jszip";
import {
  ArrowLeft,
  Cloud,
  Download,
  Image as ImageIcon,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/contexts/AuthContext";
import {
  getOwnerEvent,
  deleteEventMedia,
  fetchMediaBlob,
  type EventData,
} from "@/lib/events";

type GalleryItem = {
  id: string;
  url: string;
};

function formatDate(dateString: string) {
  const date = new Date(`${dateString.slice(0, 10)}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function OwnerEventPage() {
  const params = useParams<{ search_id: string }>();
  const router = useRouter();
  const searchId = params.search_id;

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isTablet = useMediaQuery("(min-width: 640px)");
  const columns = isDesktop ? 4 : isTablet ? 3 : 2;

  const { isAuthenticated, loading } = useAuth();

  const [event, setEvent] = useState<EventData | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadEvent = useCallback(async () => {
    if (!searchId || loading || !isAuthenticated) {
      if (!loading) {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await getOwnerEvent(searchId);

      setEvent(result.event);
      setEventId(result.eventId);

      const mediaUrls = Array.isArray(result.event.media)
        ? result.event.media
        : [];

      const mediaIds = Array.isArray(result.event.media_ids)
        ? result.event.media_ids
        : [];

      setGallery(
        mediaUrls.map((url, index) => ({
          url,
          id: mediaIds[index] ?? "",
        })),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load this event.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [searchId, loading, isAuthenticated]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    void loadEvent();
  }, [loadEvent]);

  async function handleDelete(item: GalleryItem) {
    if (!eventId || !item.id) {
      setError("This image is missing its ID and cannot be deleted.");
      return;
    }

    const confirmed = window.confirm(
      "Delete this photo permanently? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);
    setError("");
    setMessage("");

    try {
      await deleteEventMedia(eventId, item.id);

      setGallery((current) =>
        current.filter((image) => image.id !== item.id),
      );

      setMessage("Photo deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete this photo.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDownloadAll() {
    if (gallery.length === 0) {
      setError("There are no photos to download.");
      return;
    }

    setIsDownloading(true);
    setError("");
    setMessage("");

    try {
      const zip = new JSZip();

      const folderName = (event?.event_name || "event")
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
        .trim()
        .replace(/\s+/g, "-");

      const folder = zip.folder(folderName || "event");

      if (!folder) {
        throw new Error("Could not create the ZIP folder.");
      }

      const usedNames = new Set<string>();

      for (let index = 0; index < gallery.length; index++) {
        const item = gallery[index];

        // Uses cache: "no-store" in fetchMediaBlob to avoid R2 cache issues.
        const blob = await fetchMediaBlob(item.url);

        let filename = `photo-${index + 1}`;

        try {
          const pathname = new URL(item.url).pathname;
          const urlFilename = decodeURIComponent(
            pathname.split("/").pop() || "",
          );

          if (urlFilename) {
            filename = urlFilename;
          }
        } catch {
          // Use the fallback filename if the URL cannot be parsed.
        }

        // Prevent duplicate filenames within the ZIP archive.
        const dotIndex = filename.lastIndexOf(".");
        const hasExtension = dotIndex > 0;
        const baseName = hasExtension
          ? filename.slice(0, dotIndex)
          : filename;
        const extension = hasExtension
          ? filename.slice(dotIndex)
          : "";

        let uniqueName = filename;
        let duplicateIndex = 1;

        while (usedNames.has(uniqueName.toLowerCase())) {
          uniqueName = `${baseName}-${duplicateIndex}${extension}`;
          duplicateIndex++;
        }

        usedNames.add(uniqueName.toLowerCase());
        folder.file(uniqueName, blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const anchor = document.createElement("a");

      anchor.href = downloadUrl;
      anchor.download = `${folderName || "event"}.zip`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);

      setMessage("Your ZIP download is ready.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not download the event photos.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  if (loading || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f0e8] px-5 text-[#54483f]">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#5f6f62]" />
          <p className="mt-4 text-sm text-[#766b60]">
            Loading your event gallery...
          </p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f5f0e8] text-[#54483f]">
      <header className="border-b border-[#c9c1b8]/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 text-2xl font-medium tracking-tight"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#54483f]">
              <Cloud className="h-5 w-5" />
            </span>
            MementoCloud
          </Link>

          <span className="flex items-center gap-2 text-sm text-[#6d7565]">
            <ShieldCheck className="h-4 w-4" />
            Owner gallery
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:py-12">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#766b60] transition hover:text-[#54483f]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </button>

        <section className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#7b806c]">
            Your private event
          </p>

          <h1 className="break-words text-4xl font-semibold tracking-tight sm:text-5xl">
            {event?.event_name || "Your event"}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#766b60]">
            {event?.event_date && <span>{formatDate(event.event_date)}</span>}

            <span className="flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4" />
              {gallery.length} {gallery.length === 1 ? "memory" : "memories"}
            </span>
          </div>
        </section>

        <section className="mb-10 rounded-2xl border border-[#c9c1b8]/60 bg-white/60 p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-[#e8eee6] p-3 text-[#5f6f62]">
                <ImageIcon className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-semibold">Manage your memories</h2>
                <p className="mt-1 text-sm leading-6 text-[#766b60]">
                  Download all your event photos or remove individual images
                  from the album.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void loadEvent()}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#c9c1b8] bg-white px-4 py-3 text-sm font-medium transition hover:bg-[#f1eee8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => void handleDownloadAll()}
                disabled={isDownloading || gallery.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5f6f62] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#4d5b50] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDownloading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isDownloading ? "Preparing ZIP..." : "Download all"}
              </button>
            </div>
          </div>

          {isDownloading && (
            <p role="status" className="mt-4 text-sm text-[#766b60]">
              Preparing your photos. Please keep this page open until the
              download begins.
            </p>
          )}
        </section>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-[#d5dfd1] bg-[#e8eee6] p-4 text-sm text-[#435747]"
          >
            {message}
          </div>
        )}

        <section>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">All memories</h2>
              <p className="mt-1 text-sm text-[#766b60]">
                Photos shared with this event.
              </p>
            </div>

            <span className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-[#6d7565]">
              {gallery.length} {gallery.length === 1 ? "photo" : "photos"}
            </span>
          </div>

          {gallery.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#c9c1b8] bg-white/40 px-6 py-12 text-center">
              <ImageIcon className="mx-auto mb-3 h-9 w-9 text-[#5f6f62]" />

              <h3 className="font-semibold">The album is waiting</h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#766b60]">
                No photos have been added yet. Once guests share their
                memories, they will appear here.
              </p>
            </div>
          ) : (
            <ImageList
              variant="masonry"
              cols={columns}
              gap={16}
              sx={{ margin: 0 }}
            >
              {gallery.map((item, index) => (
                <ImageListItem
                  key={item.id || `${item.url}-${index}`}
                  sx={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: "14px",
                    backgroundColor: "#e8e2d8",
                    "&:hover .photo-actions, &:focus-within .photo-actions": {
                      opacity: 1,
                    },
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={`Event photo ${index + 1}`}
                    loading="lazy"
                    className="block h-auto w-full"
                  />

                  <div className="photo-actions absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/65 to-transparent px-3 pb-3 pt-10 opacity-100 transition-opacity sm:opacity-0">
                    <span className="truncate text-xs font-medium text-white">
                      Photo {index + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => void handleDelete(item)}
                      disabled={
                        deletingId === item.id ||
                        !item.id ||
                        deletingId !== null
                      }
                      aria-label={`Delete photo ${index + 1}`}
                      title={
                        item.id
                          ? "Delete photo"
                          : "This photo is missing its ID"
                      }
                      className="inline-flex shrink-0 items-center justify-center rounded-lg bg-white/95 p-2 text-red-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === item.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </section>

        <footer className="mt-16 border-t border-[#c9c1b8]/50 pt-6 text-center text-xs text-[#8b8176]">
          Your moments, all in one place.
        </footer>
      </div>
    </main>
  );
}
