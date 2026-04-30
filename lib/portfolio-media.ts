import type { PortfolioItem } from "@/lib/types";

type PortfolioMediaInput = Pick<PortfolioItem, "thumbnail_url" | "video_url" | "video_embed">;

function cleanText(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function parseUrl(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function normalizeOptionalUrl(value: string | null | undefined) {
  return cleanText(value);
}

export function extractIframeSrc(iframeText: string | null | undefined) {
  const value = cleanText(iframeText);

  if (!value) {
    return null;
  }

  const srcMatch = value.match(/src=["']([^"']+)["']/i);
  return srcMatch?.[1]?.trim() ?? null;
}

function extractYouTubeId(url: URL) {
  const hostname = url.hostname.toLowerCase();

  if (hostname.includes("youtu.be")) {
    const shortId = url.pathname.split("/").filter(Boolean)[0];
    return shortId ?? null;
  }

  if (hostname.includes("youtube.com")) {
    const watchId = url.searchParams.get("v");
    if (watchId) {
      return watchId;
    }

    const pathParts = url.pathname.split("/").filter(Boolean);
    const shortsIndex = pathParts.findIndex((part) => part === "shorts");
    if (shortsIndex >= 0 && pathParts[shortsIndex + 1]) {
      return pathParts[shortsIndex + 1];
    }

    const embedIndex = pathParts.findIndex((part) => part === "embed");
    if (embedIndex >= 0 && pathParts[embedIndex + 1]) {
      return pathParts[embedIndex + 1];
    }
  }

  return null;
}

function extractVimeoId(url: URL) {
  const hostname = url.hostname.toLowerCase();

  if (!hostname.includes("vimeo.com")) {
    return null;
  }

  const parts = url.pathname.split("/").filter(Boolean);

  for (let index = parts.length - 1; index >= 0; index -= 1) {
    const value = parts[index];
    if (/^\d+$/.test(value)) {
      return value;
    }
  }

  return null;
}

function extractDailymotionId(url: URL) {
  const hostname = url.hostname.toLowerCase();

  if (hostname.includes("dai.ly")) {
    const value = url.pathname.split("/").filter(Boolean)[0];
    return value ?? null;
  }

  if (hostname.includes("dailymotion.com")) {
    const parts = url.pathname.split("/").filter(Boolean);

    if (parts[0] === "video" && parts[1]) {
      return parts[1];
    }

    const embedIndex = parts.findIndex((part) => part === "video");
    if (embedIndex >= 0 && parts[embedIndex + 1]) {
      return parts[embedIndex + 1];
    }
  }

  return null;
}

export function resolvePortfolioSourceUrl(input: PortfolioMediaInput) {
  const iframeSrc = extractIframeSrc(input.video_embed);

  if (iframeSrc) {
    return iframeSrc;
  }

  const embedAsUrl = cleanText(input.video_embed);
  if (embedAsUrl && /^https?:\/\//i.test(embedAsUrl)) {
    return embedAsUrl;
  }

  return cleanText(input.video_url);
}

export function resolvePortfolioEmbedUrl(input: PortfolioMediaInput) {
  const source = resolvePortfolioSourceUrl(input);

  if (!source) {
    return null;
  }

  const parsedUrl = parseUrl(source);

  if (!parsedUrl) {
    return source;
  }

  const youtubeId = extractYouTubeId(parsedUrl);
  if (youtubeId) {
    return `https://www.youtube.com/embed/${youtubeId}`;
  }

  const vimeoId = extractVimeoId(parsedUrl);
  if (vimeoId) {
    return `https://player.vimeo.com/video/${vimeoId}`;
  }

  const dailymotionId = extractDailymotionId(parsedUrl);
  if (dailymotionId) {
    return `https://www.dailymotion.com/embed/video/${dailymotionId}`;
  }

  return source;
}

export function resolvePortfolioThumbnailUrl(input: PortfolioMediaInput) {
  const explicitThumbnail = cleanText(input.thumbnail_url);

  if (explicitThumbnail) {
    return explicitThumbnail;
  }

  const source = resolvePortfolioSourceUrl(input);
  const parsedUrl = parseUrl(source);

  if (!parsedUrl) {
    return null;
  }

  const youtubeId = extractYouTubeId(parsedUrl);
  if (youtubeId) {
    return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
  }

  const vimeoId = extractVimeoId(parsedUrl);
  if (vimeoId) {
    return `https://vumbnail.com/${vimeoId}.jpg`;
  }

  const dailymotionId = extractDailymotionId(parsedUrl);
  if (dailymotionId) {
    return `https://www.dailymotion.com/thumbnail/video/${dailymotionId}`;
  }

  return null;
}

export function withResolvedPortfolioThumbnail<T extends PortfolioMediaInput>(item: T): T {
  return {
    ...item,
    thumbnail_url: resolvePortfolioThumbnailUrl(item),
  } as T;
}
