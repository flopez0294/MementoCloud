import { getAccessToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type CreateEventData = {
  event_name: string;
  event_date: string;
  timezone: string;
  password: string;
};

export type CreateEventResponse = {
  status: string;
  event_id: string;
  search_id: string;
};

export type Event = {
  id: string;
  search_id: string;
  event_name: string;
  event_date: string;
};

export type GuestEventData = {
  search_id: string;
  event_name: string;
  event_date: string;
  media: string[];
  media_ids: string[];
};

type ApiErrorResponse = {
  detail?: string;
};

function getApiUrl(): string {
  if (!API_URL) {
    throw new Error("The API URL is not configured.");
  }

  return API_URL;
}

async function getErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  const result: ApiErrorResponse | null = await response
    .json()
    .catch(() => null);

  if (response.status === 401 || response.status === 403) {
    return "Your session has expired or you do not have permission to access this resource.";
  }

  return typeof result?.detail === "string"
    ? result.detail
    : fallback;
}

/**
 * Create an event using the signed-in host's access token.
 */
export async function createEvent(
  data: CreateEventData
): Promise<CreateEventResponse> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("You must be signed in to create an event.");
  }

  const response = await fetch(`${getApiUrl()}/api/event`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to create your event.")
    );
  }

  return (await response.json()) as CreateEventResponse;
}

/**
 * Get events belonging to the signed-in host.
 */
export async function getEvents(): Promise<Event[]> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("You must be signed in to view your events.");
  }

  const response = await fetch(`${getApiUrl()}/api/event`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to load your events.")
    );
  }

  return (await response.json()) as Event[];
}

/**
 * Get one event's details and media using its guest access token.
 *
 * This endpoint uses the guest token, NOT the host access token.
 */
export async function getSearchEvent(
  search_id: string,
  guestToken: string
): Promise<GuestEventData> {
  if (!search_id || search_id === "undefined") {
    throw new Error("A valid event ID is required.");
  }

  if (!guestToken) {
    throw new Error("Verify the event password to view this album.");
  }

  const response = await fetch(
    `${getApiUrl()}/api/event/${encodeURIComponent(search_id)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${guestToken}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Unable to load this event's photos."
      )
    );
  }

  return (await response.json()) as GuestEventData;
}


export type GuestImageUploadResult = {
  uploadedCount: number;
  failedFiles: string[];
};

type PresignedUpload = {
  id: string;
  filename: string;
  content_type: string;
  uploadURL: string;
};

type RejectedUpload = {
  filename: string;
  reason: string;
};

type PresignedUploadResponse = {
  success?: boolean;
  message?: string;
  media?: PresignedUpload[];
  uploaded_files?: PresignedUpload[];
  rejected_files?: RejectedUpload[];
  detail?: string | { message?: string; rejected_files?: RejectedUpload[] };
};

export async function uploadGuestImages(
  searchId: string,
  files: File[],
  guestToken: string
): Promise<GuestImageUploadResult> {
  if (!API_URL) {
    throw new Error("The API URL is not configured.");
  }

  if (!searchId || searchId === "undefined") {
    throw new Error("A valid event ID is required.");
  }

  if (!guestToken) {
    throw new Error("Verify the event password before uploading.");
  }

  if (files.length === 0) {
    throw new Error("Select at least one image to upload.");
  }

  if (files.length > 10) {
    throw new Error("You can upload a maximum of 10 images at a time.");
  }

  const allowedTypes = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/svg+xml",
    "image/heic",
    "image/heif",
  ]);

  const preparedFiles = files.map((file) => {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

    const extensionTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      svg: "image/svg+xml",
      heic: "image/heic",
      heif: "image/heif",
    };

    const contentType =
      file.type || extensionTypes[extension] || "";

    if (!allowedTypes.has(contentType)) {
      throw new Error(
        `${file.name} is not a supported image format.`
      );
    }

    if (file.size > 20 * 1024 * 1024) {
      throw new Error(`${file.name} exceeds the 20 MB limit.`);
    }

    if (file.size <= 0) {
      throw new Error(`${file.name} is empty.`);
    }

    return { file, contentType };
  });

  const response = await fetch(
    `${API_URL}/api/event/${encodeURIComponent(searchId)}/upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${guestToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        files: preparedFiles.map(({ file, contentType }) => ({
          filename: file.name,
          content_type: contentType,
          size: file.size,
        })),
      }),
    }
  );

  const data: PresignedUploadResponse | null =
    await response.json().catch(() => null);

  if (!response.ok && response.status !== 207) {
    const detail = data?.detail;

    const message =
      typeof detail === "string"
        ? detail
        : detail?.message || data?.message;

    const rejected = Array.isArray(detail)
      ? detail
      : detail && typeof detail === "object"
        ? detail.rejected_files
        : data?.rejected_files;

    const rejectionDetails = rejected
      ?.map((item) =>
        typeof item === "string"
          ? item
          : `${item.filename}: ${item.reason}`
      )
      .join("\n");

    throw new Error(
      [message || "Unable to prepare image uploads.", rejectionDetails]
        .filter(Boolean)
        .join("\n")
    );
  }

  const uploads = data?.media ?? data?.uploaded_files ?? [];
  const failedFiles = (data?.rejected_files ?? []).map(
    (item) => `${item.filename}: ${item.reason}`
  );

  let uploadedCount = 0;

  for (const upload of uploads) {
    // Match by filename and content type; the backend preserves the
    // original filename in each presigned upload response.
    const prepared = preparedFiles.find(
      ({ file, contentType }) =>
        file.name === upload.filename &&
        contentType === upload.content_type
    );

    if (!prepared) {
      failedFiles.push(
        `${upload.filename}: Could not match the selected file.`
      );
      continue;
    }

    try {
      const storageResponse = await fetch(upload.uploadURL, {
        method: "PUT",
        headers: {
          "Content-Type": upload.content_type,
        },
        body: prepared.file,
      });

      if (!storageResponse.ok) {
        throw new Error("Storage upload failed.");
      }

      const completeResponse = await fetch(
        `${API_URL}/api/event/${encodeURIComponent(searchId)}/upload/complete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${guestToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            media_id: upload.id,
          }),
        }
      );

      if (!completeResponse.ok) {
        const result = await completeResponse.json().catch(() => null);

        throw new Error(
          typeof result?.detail === "string"
            ? result.detail
            : "The server could not confirm the upload."
        );
      }

      uploadedCount++;
    } catch (error) {
      failedFiles.push(
        `${upload.filename}: ${
          error instanceof Error ? error.message : "Upload failed."
        }`
      );
    }
  }

  if (uploadedCount === 0 && failedFiles.length > 0) {
    throw new Error(
      `No images were uploaded successfully.\n${failedFiles.join("\n")}`
    );
  }

  return {
    uploadedCount,
    failedFiles,
  };
}
