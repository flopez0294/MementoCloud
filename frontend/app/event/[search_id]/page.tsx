// "use client";

// import { useEffect, useState, type FormEvent } from "react";
// import { useParams } from "next/navigation";
// import Link from "next/link";
// import { useGuestAuth } from "@/contexts/GuestAuthContext";
// import {
//   getSearchEvent,
//   type GuestEventData,
// } from "@/lib/events";
// import {
//   ArrowLeft,
//   CalendarDays,
//   Check,
//   Cloud,
//   Image as ImageIcon,
//   LockKeyhole,
//   ShieldCheck,
// } from "lucide-react";
// import { ImageList, ImageListItem } from "@mui/material";
// import useMediaQuery from "@mui/material/useMediaQuery";

// function formatEventDate(value: string) {
//   return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString(
//     "en-US",
//     {
//       month: "long",
//       day: "numeric",
//       year: "numeric",
//     }
//   );
// }

// export default function EventPage() {
//   const params = useParams<{ search_id: string }>();
//   const searchId = params.search_id;

//   const {
//     guestToken,
//     guestSearchId,
//     isVerifying,
//     verifyEventPassword,
//     restoreGuestSession,
//   } = useGuestAuth();

//   const [password, setPassword] = useState("");
//   const [event, setEvent] = useState<GuestEventData | null>(null);
//   const [isSessionReady, setIsSessionReady] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [retryKey, setRetryKey] = useState(0);

//   // Two columns on phones, three on larger screens.
//   const isMediumScreen = useMediaQuery("(min-width: 768px)", {
//     noSsr: true,
//   });

//   const isAuthenticated =
//     Boolean(guestToken) && guestSearchId === searchId;

//   // Restore the session for the current event.
//   useEffect(() => {
//     setIsSessionReady(false);
//     restoreGuestSession(searchId);
//     setIsSessionReady(true);
//   }, [searchId, restoreGuestSession]);

//   // Load event data through the API helper in lib/events.ts.
//   useEffect(() => {
//     if (!isSessionReady || !isAuthenticated || !guestToken) {
//       setEvent(null);
//       setIsLoading(false);
//       return;
//     }

//     let cancelled = false;

//     async function loadEvent() {
//       setIsLoading(true);
//       setError("");

//       try {
//         const data = await getSearchEvent(searchId, guestToken!);

//         if (!cancelled) {
//           setEvent(data);
//         }
//       } catch (err) {
//         if (!cancelled) {
//           setError(
//             err instanceof Error
//               ? err.message
//               : "Unable to load this event's photos."
//           );
//           setEvent(null);
//         }
//       } finally {
//         if (!cancelled) {
//           setIsLoading(false);
//         }
//       }
//     }

//     void loadEvent();

//     return () => {
//       cancelled = true;
//     };
//   }, [
//     isSessionReady,
//     isAuthenticated,
//     searchId,
//     guestToken,
//     retryKey,
//   ]);

//   // Password verification stays in GuestAuthContext.
//   async function handlePasswordSubmit(
//     e: FormEvent<HTMLFormElement>
//   ) {
//     e.preventDefault();
//     setError("");

//     try {
//       await verifyEventPassword(searchId, password);
//       setPassword("");
//     } catch (err) {
//       setError(
//         err instanceof Error
//           ? err.message
//           : "Incorrect password. Please try again."
//       );
//     }
//   }

//   if (!isSessionReady) {
//     return (
//       <main className="flex min-h-screen items-center justify-center bg-[#f5f0e8] text-[#54483f]">
//         <div className="text-center">
//           <Cloud className="mx-auto mb-4 h-8 w-8 text-[#5f6f62]" />
//           <p className="text-sm text-[#54483f]/60">
//             Preparing your event...
//           </p>
//         </div>
//       </main>
//     );
//   }

//   // Guest password screen.
//   if (!isAuthenticated) {
//     return (
//       <main className="flex min-h-screen flex-col overflow-hidden bg-[#f5f0e8] text-[#3f3934]">
//         <header className="flex h-20 items-center justify-between border-b border-[#54483f]/10 px-5 sm:px-8 lg:px-12">
//           <Link
//             href="/"
//             className="flex items-center gap-2.5 text-xl font-medium tracking-tight"
//           >
//             <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#54483f]/50">
//               <Cloud size={19} />
//             </span>
//             MementoCloud
//           </Link>

//           <span className="flex items-center gap-2 text-xs text-[#54483f]/55 sm:text-sm">
//             <LockKeyhole size={15} />
//             Private event
//           </span>
//         </header>

//         <section className="relative flex flex-1 items-center px-5 py-16 sm:px-8 lg:px-12">
//           <div className="pointer-events-none absolute -right-16 top-16 h-64 w-64 bg-[#c9c1b8]/30 sm:right-8 sm:h-80 sm:w-80" />
//           <div className="pointer-events-none absolute bottom-12 left-8 h-28 w-28 bg-[#9b9a86]/20 sm:left-20 sm:h-40 sm:w-40" />

//           <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
//             <div className="max-w-xl">
//               <p className="mb-6 text-xs font-medium uppercase tracking-[0.3em] text-[#5f6f62]">
//                 Your moments. Forever.
//               </p>

//               <h1 className="text-5xl font-normal leading-[0.96] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
//                 Memories worth
//                 <br />
//                 <span className="text-[#5f6f62]">
//                   sharing together.
//                 </span>
//               </h1>

//               <p className="mt-7 max-w-md text-sm leading-7 text-[#54483f]/65 sm:text-base">
//                 You&apos;ve been invited to a private event album.
//                 Enter the password provided by your host to view
//                 the photos and memories everyone has shared.
//               </p>

//               <div className="mt-8 flex flex-wrap gap-5 text-xs text-[#54483f]/60 sm:text-sm">
//                 <span className="flex items-center gap-2">
//                   <ShieldCheck size={16} className="text-[#5f6f62]" />
//                   Private access
//                 </span>
//                 <span className="flex items-center gap-2">
//                   <Cloud size={16} className="text-[#5f6f62]" />
//                   All together
//                 </span>
//               </div>
//             </div>

//             <div className="relative mx-auto w-full max-w-md">
//               <div className="absolute -left-3 -top-3 h-20 w-20 bg-[#9b9a86]/50 sm:-left-5 sm:-top-5 sm:h-28 sm:w-28" />
//               <div className="absolute -bottom-3 -right-3 h-20 w-20 bg-[#c9c1b8]/70 sm:-bottom-5 sm:-right-5 sm:h-28 sm:w-28" />

//               <div className="relative border border-[#54483f]/10 bg-[#faf7f1] p-6 shadow-[0_25px_70px_rgba(84,72,63,0.10)] sm:p-9">
//                 <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-full bg-[#e2e5db] text-[#5f6f62]">
//                   <LockKeyhole size={22} strokeWidth={1.6} />
//                 </div>

//                 <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-[#5f6f62]">
//                   Guest access
//                 </p>

//                 <h2 className="text-3xl font-normal tracking-[-0.04em]">
//                   Enter the event.
//                 </h2>

//                 <p className="mt-3 text-sm leading-6 text-[#54483f]/60">
//                   Use the password your host shared with you.
//                 </p>

//                 <form
//                   onSubmit={handlePasswordSubmit}
//                   className="mt-7 space-y-4"
//                 >
//                   <label
//                     htmlFor="event-password"
//                     className="block text-xs font-medium text-[#54483f]"
//                   >
//                     Event password
//                   </label>

//                   <input
//                     id="event-password"
//                     type="password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="Enter password"
//                     autoComplete="current-password"
//                     required
//                     className="w-full border border-[#c9c1b8] bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-[#54483f]/35 focus:border-[#5f6f62] focus:ring-2 focus:ring-[#5f6f62]/10"
//                   />

//                   {error && (
//                     <p role="alert" className="text-sm text-red-700">
//                       {error}
//                     </p>
//                   )}

//                   <button
//                     type="submit"
//                     disabled={isVerifying || !password.trim()}
//                     className="flex w-full items-center justify-center gap-2 bg-[#5f6f62] px-5 py-3.5 text-sm font-medium text-[#f5f0e8] transition hover:-translate-y-0.5 hover:bg-[#4f6053] disabled:cursor-not-allowed disabled:opacity-50"
//                   >
//                     {isVerifying ? "Verifying..." : "View event"}
//                     {!isVerifying && <Check size={16} />}
//                   </button>
//                 </form>

//                 <p className="mt-6 border-t border-[#54483f]/10 pt-5 text-xs leading-5 text-[#54483f]/45">
//                   Your event is private. Only people with the event
//                   password can access this album.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </section>

//         <footer className="border-t border-[#54483f]/10 px-5 py-5 text-center text-xs text-[#54483f]/45 sm:px-8">
//           MementoCloud · Real moments. Lasting memories.
//         </footer>
//       </main>
//     );
//   }

//   // Authenticated event gallery.
//   return (
//     <main className="min-h-screen bg-[#f5f0e8] text-[#3f3934]">
//       <header className="sticky top-0 z-30 flex min-h-[72px] items-center justify-between border-b border-[#54483f]/10 bg-[#f5f0e8]/90 px-5 backdrop-blur-md sm:px-8 lg:px-10">
//         <Link
//           href="/"
//           className="flex items-center gap-2.5 text-lg font-medium tracking-tight sm:text-xl"
//         >
//           <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#54483f]/40">
//             <Cloud size={19} />
//           </span>
//           MementoCloud
//         </Link>

//         <span className="flex items-center gap-2 rounded-full bg-[#e2e5db] px-3 py-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#5f6f62] sm:text-xs">
//           <LockKeyhole size={13} />
//           Private album
//         </span>
//       </header>

//       <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
//         <Link
//           href="/"
//           className="mb-8 inline-flex items-center gap-2 text-sm text-[#54483f]/60 transition hover:text-[#5f6f62]"
//         >
//           <ArrowLeft size={16} />
//           MementoCloud home
//         </Link>

//         <section className="relative mb-10 overflow-hidden border border-[#54483f]/10 bg-[#faf7f1] px-6 py-8 sm:px-10 sm:py-12 lg:mb-14 lg:px-14 lg:py-14">
//           <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full border border-[#5f6f62]/20 sm:right-8 sm:h-64 sm:w-64" />
//           <div className="pointer-events-none absolute -right-4 -top-9 h-32 w-32 rounded-full border border-[#5f6f62]/20 sm:right-20 sm:h-48 sm:w-48" />

//           <div className="relative z-10 max-w-3xl">
//             <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-[#5f6f62]">
//               Your moments. Forever.
//             </p>

//             <h1 className="break-words text-4xl font-normal leading-[1.02] tracking-[-0.05em] sm:text-5xl lg:text-7xl">
//               {event?.event_name ?? "Your event memories"}
//             </h1>

//             {event?.event_date && (
//               <p className="mt-5 flex items-center gap-2 text-sm text-[#54483f]/60 sm:text-base">
//                 <CalendarDays size={17} className="text-[#5f6f62]" />
//                 {formatEventDate(event.event_date)}
//               </p>
//             )}

//             <p className="mt-5 max-w-xl text-sm leading-7 text-[#54483f]/60 sm:text-base">
//               Every moment, collected in one place. Take a look
//               through the photos shared by everyone at your event.
//             </p>

//             <div className="mt-6 inline-flex items-center gap-2 text-xs text-[#5f6f62] sm:text-sm">
//               <ShieldCheck size={16} />
//               You&apos;re viewing a private event album
//             </div>
//           </div>
//         </section>

//         <section>
//           <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
//             <div>
//               <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.25em] text-[#5f6f62]">
//                 The collection
//               </p>
//               <h2 className="text-3xl font-normal tracking-[-0.04em] sm:text-4xl">
//                 Shared memories.
//               </h2>
//             </div>

//             {event && (
//               <p className="text-sm text-[#54483f]/55">
//                 {event.media.length}{" "}
//                 {event.media.length === 1 ? "photo" : "photos"}
//               </p>
//             )}
//           </div>

//           {isLoading && (
//             <div
//               className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5"
//               aria-label="Loading photos"
//               aria-live="polite"
//             >
//               {Array.from({ length: 6 }).map((_, index) => (
//                 <div
//                   key={index}
//                   className={`animate-pulse bg-[#e6e4d9] ${
//                     index % 3 === 1 ? "aspect-[3/4]" : "aspect-square"
//                   }`}
//                 />
//               ))}
//             </div>
//           )}

//           {error && (
//             <div
//               role="alert"
//               className="border border-red-200 bg-[#faf7f1] p-6"
//             >
//               <p className="text-sm leading-6 text-red-700">{error}</p>
//               <button
//                 type="button"
//                 onClick={() => setRetryKey((key) => key + 1)}
//                 className="mt-3 text-sm font-medium text-[#5f6f62] underline underline-offset-4"
//               >
//                 Try again
//               </button>
//             </div>
//           )}

//           {!isLoading && !error && event && event.media.length === 0 && (
//             <div className="border border-dashed border-[#54483f]/20 bg-[#faf7f1] px-6 py-16 text-center sm:py-20">
//               <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e2e5db] text-[#5f6f62]">
//                 <ImageIcon size={24} strokeWidth={1.5} />
//               </div>

//               <h3 className="mt-5 text-2xl font-normal tracking-tight">
//                 The memories start here.
//               </h3>

//               <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#54483f]/60">
//                 There aren&apos;t any photos in this album yet.
//                 When guests share their moments, they&apos;ll appear here.
//               </p>
//             </div>
//           )}

//           {!isLoading && !error && event && event.media.length > 0 && (
//             <ImageList
//               variant="masonry"
//               cols={isMediumScreen ? 3 : 2}
//               gap={12}
//               sx={{
//                 margin: 0,
//                 width: "100%",
//                 "& .MuiImageListItem-root": {
//                   overflow: "hidden",
//                   borderRadius: "2px",
//                   backgroundColor: "#e6e4d9",
//                 },
//                 "& img": {
//                   display: "block",
//                   width: "100%",
//                   height: "auto",
//                   transition: "transform 350ms ease",
//                 },
//                 "& .MuiImageListItem-root:hover img": {
//                   transform: "scale(1.025)",
//                 },
//               }}
//             >
//               {event.media.map((url, index) => (
//                 <ImageListItem
//                   key={event.media_ids?.[index] ?? `${url}-${index}`}
//                 >
//                   <img
//                     src={url}
//                     alt={`Event memory ${index + 1}`}
//                     loading="lazy"
//                   />
//                 </ImageListItem>
//               ))}
//             </ImageList>
//           )}
//         </section>

//         <footer className="mt-16 flex flex-col gap-3 border-t border-[#54483f]/15 pt-6 text-xs text-[#54483f]/45 sm:flex-row sm:items-center sm:justify-between">
//           <span className="flex items-center gap-2">
//             <Cloud size={15} />
//             MementoCloud
//           </span>
//           <span>Real moments. Lasting memories.</span>
//         </footer>
//       </div>
//     </main>
//   );
// }

"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useParams } from "next/navigation";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  ArrowLeft,
  Cloud,
  ImagePlus,
  LockKeyhole,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { useGuestAuth } from "@/contexts/GuestAuthContext";
import {
  getSearchEvent,
  uploadGuestImages,
  type GuestEventData,
} from "@/lib/events";

type GalleryItem = {
  id: string;
  url: string;
};

const MAX_FILES = 10;
const MAX_IMAGE_SIZE = 20 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/heic",
  "image/heif",
]);

function formatDate(dateString: string) {
  const date = new Date(`${dateString}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function GuestEventPage() {
  const params = useParams<{ search_id: string }>();
  const searchId = params.search_id;

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isTablet = useMediaQuery("(min-width: 640px)");
  const columns = isDesktop ? 4 : isTablet ? 3 : 2;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    guestToken,
    guestSearchId,
    isVerifying,
    verifyEventPassword,
    restoreGuestSession,
  } = useGuestAuth();

  const [password, setPassword] = useState("");
  const [event, setEvent] = useState<GuestEventData | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [isSessionReady, setIsSessionReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const [error, setError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const isAuthenticated =
    Boolean(guestToken) && guestSearchId === searchId;

  // Restore the guest's saved session for this event.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      setIsSessionReady(false);

      try {
        if (searchId) {
          await restoreGuestSession(searchId);
        }
      } catch {
        // If there is no valid saved session, show the password gate.
      } finally {
        if (!cancelled) {
          setIsSessionReady(true);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [searchId, restoreGuestSession]);

  // Fetch event details and refresh the gallery after uploads.
  const loadEvent = useCallback(async () => {
    if (!searchId || !guestToken || guestSearchId !== searchId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await getSearchEvent(searchId, guestToken);

      setEvent(data);

      const mediaUrls = Array.isArray(data.media) ? data.media : [];
      const mediaIds = Array.isArray(data.media_ids) ? data.media_ids : [];

      setGallery(
        mediaUrls.map((url, index) => ({
          url,
          id: mediaIds[index] ?? `${searchId}-${index}`,
        })),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load this event.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [searchId, guestToken, guestSearchId]);

  useEffect(() => {
    if (!isSessionReady) return;

    if (isAuthenticated) {
      void loadEvent();
    } else {
      setIsLoading(false);
      setEvent(null);
      setGallery([]);
    }
  }, [isSessionReady, isAuthenticated, loadEvent, retryKey]);

  async function handleVerifyPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!searchId || !password.trim()) {
      setError("Please enter the event password.");
      return;
    }

    setError("");
    setUploadMessage("");

    try {
      // The guest auth context handles verification and saving the guest token.
      await verifyEventPassword(searchId, password);
      setPassword("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to verify the event password.",
      );
    }
  }

  function validateImages(files: File[]) {
    if (files.length === 0) {
      return "Choose at least one image to upload.";
    }

    if (files.length > MAX_FILES) {
      return `You can select up to ${MAX_FILES} images at a time.`;
    }

    for (const file of files) {
      const extension = file.name.split(".").pop()?.toLowerCase();

      const extensionTypes: Record<string, string> = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
        svg: "image/svg+xml",
        heic: "image/heic",
        heif: "image/heif",
      };

      const contentType = file.type || (extension ? extensionTypes[extension] : "");

      if (!contentType || !ALLOWED_IMAGE_TYPES.has(contentType)) {
        return `"${file.name}" is not a supported image type.`;
      }

      if (file.size === 0) {
        return `"${file.name}" is empty.`;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        return `"${file.name}" exceeds the 20 MB image limit.`;
      }
    }

    return null;
  }

  function handleFileSelection(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);

    setError("");
    setUploadMessage("");

    if (files.length === 0) {
      setSelectedFiles([]);
      return;
    }

    const validationError = validateImages(files);

    if (validationError) {
      setError(validationError);
      setSelectedFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setSelectedFiles(files);
  }

  function removeSelectedFile(indexToRemove: number) {
    setSelectedFiles((current) =>
      current.filter((_, index) => index !== indexToRemove),
    );

    setError("");
    setUploadMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleUpload() {
    if (!searchId || !guestToken || guestSearchId !== searchId) {
      setError("Please verify the event password again.");
      return;
    }

    const validationError = validateImages(selectedFiles);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsUploading(true);
    setError("");
    setUploadMessage("");

    try {
      const result = await uploadGuestImages(
        searchId,
        selectedFiles,
        guestToken,
      );

      setSelectedFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setUploadMessage(
        result.failedFiles.length > 0
          ? `${result.uploadedCount} image(s) uploaded. These files could not be uploaded: ${result.failedFiles.join(", ")}`
          : `Successfully uploaded ${result.uploadedCount} image(s)!`,
      );

      // Reload event data so newly completed uploads appear in the gallery.
      setRetryKey((current) => current + 1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while uploading your images.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  // Wait for the guest session to be restored.
  if (!isSessionReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f0e8] px-5 text-[#54483f]">
        <p className="text-sm text-[#766b60]">Checking your session...</p>
      </main>
    );
  }

  // Password gate.
  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f0e8] px-5 py-12 text-[#54483f]">
        <section className="w-full max-w-md rounded-3xl border border-[#c9c1b8]/60 bg-white/80 p-8 shadow-sm">
          <LockKeyhole className="mb-5 h-8 w-8 text-[#5f6f62]" />

          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#7b806c]">
            Private event album
          </p>

          <h1 className="text-3xl font-semibold">Your memories await.</h1>

          <p className="mt-3 text-sm leading-6 text-[#766b60]">
            Enter the event password to view the album and share your photos.
          </p>

          <form onSubmit={handleVerifyPassword} className="mt-7 space-y-4">
            <label
              htmlFor="event-password"
              className="block text-sm font-medium"
            >
              Event password
            </label>

            <input
              id="event-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter the password"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-[#c9c1b8] bg-[#faf8f4] px-4 py-3 text-sm outline-none focus:border-[#5f6f62]"
            />

            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full rounded-xl bg-[#5f6f62] px-4 py-3 text-sm font-medium text-white hover:bg-[#4d5b50] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isVerifying ? "Checking..." : "Open album"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  if (isLoading || !event) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f0e8] px-5 text-[#54483f]">
        <p className="text-sm text-[#766b60]">
          {error || "Loading event..."}
        </p>
      </main>
    );
  }

  // Authenticated event page.
  return (
    <main className="min-h-screen bg-[#f5f0e8] text-[#54483f]">
      <header className="border-b border-[#c9c1b8]/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-2xl font-medium tracking-tight"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2">
              <Cloud />
            </span>

            MementoCloud
          </Link>

          <span className="flex items-center gap-2 text-sm text-[#6d7565]">
            <ShieldCheck className="h-4 w-4" />
            Private album
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:py-14">
        <section className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#7b806c]">
            Event album
          </p>

          <h1 className="break-words text-4xl font-semibold">
            {event.event_name}
          </h1>

          <p className="mt-3 text-sm text-[#766b60]">
            {formatDate(event.event_date)} · {gallery.length} memories
          </p>
        </section>

        {/* Image upload section */}
        <section className="mb-10 rounded-2xl border border-[#c9c1b8]/60 bg-white/60 p-5 sm:p-7">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-[#e8eee6] p-3 text-[#5f6f62]">
              <Upload className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">Share your photos</h2>
              <p className="mt-1 text-sm leading-6 text-[#766b60]">
                Add up to 10 images at a time. Each image can be up to 20 MB.
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.svg,.heic,.heif"
            multiple
            onChange={handleFileSelection}
            className="hidden"
            disabled={isUploading}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#b9c3b5] bg-white px-4 py-3 text-sm font-medium text-[#4d5b50] transition hover:bg-[#f1f3ed] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <ImagePlus className="h-4 w-4" />
            Choose images
          </button>

          {selectedFiles.length > 0 && (
            <div className="mt-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold">
                  Selected images ({selectedFiles.length})
                </h3>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFiles([]);
                    setError("");
                    setUploadMessage("");

                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  disabled={isUploading}
                  className="text-xs text-[#766b60] underline underline-offset-4 hover:text-[#54483f] disabled:opacity-50"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#e1dbd1] bg-white/80 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {file.name}
                      </p>
                      <p className="mt-1 text-xs text-[#8b8176]">
                        {formatFileSize(file.size)}
                      </p>
                    </div>

                    <button
                      type="button"
                      aria-label={`Remove ${file.name}`}
                      disabled={isUploading}
                      onClick={() => removeSelectedFile(index)}
                      className="shrink-0 rounded-lg p-2 transition hover:bg-[#e8e2d8] disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading || selectedFiles.length === 0}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#54483f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#40372f] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <Upload className="h-4 w-4" />
                {isUploading
                  ? "Uploading images..."
                  : `Upload ${selectedFiles.length} image${selectedFiles.length === 1 ? "" : "s"}`}
              </button>
            </div>
          )}

          {isUploading && (
            <p className="mt-4 text-sm text-[#766b60]" role="status">
              Please keep this page open while your images upload.
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {uploadMessage && (
            <p
              role="status"
              className="mt-4 rounded-xl border border-[#d5dfd1] bg-[#e8eee6] p-3 text-sm text-[#435747]"
            >
              {uploadMessage}
            </p>
          )}
        </section>

        {/* Existing event gallery */}
        <section>
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">All memories</h2>

            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              disabled={isLoading || isUploading}
              className="text-sm text-[#766b60] underline underline-offset-4 transition hover:text-[#54483f] disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {gallery.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#c9c1b8] bg-white/40 px-6 py-12 text-center">
              <ImagePlus className="mx-auto mb-3 h-8 w-8 text-[#5f6f62]" />

              <h3 className="font-semibold">The album is waiting</h3>

              <p className="mt-2 text-sm text-[#766b60]">
                No photos have been added yet. Be the first to share a memory.
              </p>
            </div>
          ) : (
            <ImageList
              variant="masonry"
              cols={columns}
              gap={16}
              sx={{ margin: 0 }}
            >
              {gallery.map((item) => (
                <ImageListItem
                  key={item.id}
                  sx={{
                    overflow: "hidden",
                    borderRadius: "14px",
                    backgroundColor: "#e8e2d8",
                  }}
                > 
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt="Event memory"
                      loading="lazy"
                      className="block h-auto w-full"
                    />
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </section>

        <footer className="mt-16 border-t border-[#c9c1b8]/50 pt-6 text-center text-xs text-[#8b8176]">
          Shared with love, kept private with MementoCloud.
        </footer>
      </div>
    </main>
  );
}