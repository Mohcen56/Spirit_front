/**
 * Utility functions for handling image URLs
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const CDN_HOST = 'cdn.triviaspirit.com';
const R2_HOST_SUFFIX = '.r2.cloudflarestorage.com';

/**
 * Converts a potentially relative image URL to an absolute URL
 * @param imageUrl - The image URL from the API (could be relative or absolute)
 * @returns Full absolute URL for the image
 */
export function getFullImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) {
    return null;
  }

  // If it's already an absolute URL, optionally rewrite to CDN
  if (imageUrl.startsWith('http')) {
    try {
      const url = new URL(imageUrl);
      // Rewrite Cloudflare R2 host to CDN host if detected
      if (url.hostname.endsWith(R2_HOST_SUFFIX)) {
        url.hostname = CDN_HOST;
        return url.toString();
      }
      return imageUrl;
    } catch {
      return imageUrl;
    }
  }

  // If it's a relative URL (starts with /), prepend the API base URL
  if (imageUrl.startsWith('/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }

  // If it's a relative path without leading slash, add it
  return `${API_BASE_URL}/${imageUrl}`;
}