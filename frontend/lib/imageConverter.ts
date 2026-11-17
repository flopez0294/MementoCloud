
import { heicTo, isHeic } from "heic-to";

/**
 * Converts a HEIC/HEIF image to a JPEG Blob for browser display.
 *
 * The original file is never modified.
 *
 * @param file - The original image file.
 * @param quality - JPEG quality between 0 and 1.
 * @returns The original Blob if it is not HEIC, otherwise a JPEG Blob.
 */
export async function convertToDisplayImage(
  file: File,
  quality = 0.85,
): Promise<Blob> {
  if (!Number.isFinite(quality) || quality < 0 || quality > 1) {
    throw new RangeError("JPEG quality must be between 0 and 1.");
  }

  if (!(await isHeic(file))) {
    return file;
  }

  return heicTo({
    blob: file,
    type: "image/jpeg",
    quality,
  });
}

/**
 * Creates a browser-displayable URL for an image.
 *
 * HEIC/HEIF files are converted to JPEG first. Other images
 * are displayed in their original format.
 *
 * @param file - The original image file.
 * @param quality - JPEG quality between 0 and 1.
 * @returns An object URL that must eventually be revoked.
 */
export async function createDisplayImageUrl(
  file: File,
  quality = 0.85,
): Promise<string> {
  const displayBlob = await convertToDisplayImage(file, quality);

  return URL.createObjectURL(displayBlob);
}


/**
 * Creates a browser-displayable URL from an image URL.
 *
 * Fetches the image from its source, converts HEIC/HEIF to JPEG
 * when needed, and leaves the stored original untouched.
 */
export async function createDisplayUrlFromRemote(
  url: string,
  quality = 0.85,
): Promise<string> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const blob = await response.blob();

  if (!Number.isFinite(quality) || quality < 0 || quality > 1) {
    throw new RangeError("JPEG quality must be between 0 and 1.");
  }

  const file = new File([blob], "image", {
    type: blob.type,
  });


  const displayBlob = (await isHeic(file))
    ? await heicTo({
        blob,
        type: "image/jpeg",
        quality,
      })
    : blob;

  return URL.createObjectURL(displayBlob);
}
