import type { PortfolioItem } from "@/lib/types";

type PortfolioMediaInput = Pick<PortfolioItem, "thumbnail_url" | "video_url" | "video_embed">;

const remoteThumbnailDomains = [
  "youtube.com",
  "youtu.be",
  "vimeo.com",
  "dailymotion.com",
  "dai.ly",
  "instagram.com",
  "facebook.com",
  "fb.watch",
  "tiktok.com",
  "linkedin.com",
];

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

function hostnameMatches(hostname: string, domain: string) {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

function isRemoteThumbnailDomain(hostname: string) {
  const normalized = hostname.toLowerCase();
  return remoteThumbnailDomains.some((domain) => hostnameMatches(normalized, domain));
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;|&#39;/gi, "'")
    .replace(/&#x2f;|&#47;/gi, "/")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function resolveCandidateUrl(candidate: string, baseUrl: string) {
  const normalized = decodeHtmlEntities(candidate).trim();

  if (!normalized) {
    return null;
  }

  const maybePrefixed = normalized.startsWith("//") ? `https:${normalized}` : normalized;

  try {
    const resolved = new URL(maybePrefixed, baseUrl);

    if (!/^https?:$/i.test(resolved.protocol)) {
      return null;
    }

    return resolved.toString();
  } catch {
    return null;
  }
}

function extractMetaImageUrl(html: string, baseUrl: string) {
  const patterns = [
    /<meta[^>]+(?:property|name)=["'](?:og:image:secure_url|og:image|twitter:image:src|twitter:image)["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image:secure_url|og:image|twitter:image:src|twitter:image)["'][^>]*>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    const candidate = match?.[1];

    if (!candidate) {
      continue;
    }

    const resolved = resolveCandidateUrl(candidate, baseUrl);
    if (resolved) {
      return resolved;
    }
  }

  return null;
}

async function fetchRemoteThumbnailByMetadata(url: URL) {
  if (!isRemoteThumbnailDomain(url.hostname)) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5500);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent":
          "Mozilla/5.0 (compatible; SwikritThumbnailResolver/1.0; +https://swikrit.com)",
      },
    });

    if (!response.ok) {
      return null;
    }

    const contentType = (response.headers.get("content-type") ?? "").toLowerCase();
    if (!contentType.includes("text/html")) {
      return null;
    }

    const html = (await response.text()).slice(0, 700_000);
    const resolved = extractMetaImageUrl(html, response.url || url.toString());

    return resolved;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
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

function extractAbsoluteUrlFromText(rawText: string | null | undefined) {
  const value = cleanText(rawText);

  if (!value) {
    return null;
  }

  const decoded = decodeHtmlEntities(value);
  const absoluteMatch = decoded.match(/https?:\/\/[^\s"'<>]+/i);

  if (!absoluteMatch?.[0]) {
    return null;
  }

  return absoluteMatch[0].trim();
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

function extractInstagramPost(url: URL) {
  const hostname = url.hostname.toLowerCase();

  if (!hostname.includes("instagram.com")) {
    return null;
  }

  const parts = url.pathname.split("/").filter(Boolean);
  const markerIndex = parts.findIndex((part) => part === "p" || part === "reel" || part === "tv");

  if (markerIndex < 0 || !parts[markerIndex + 1]) {
    return null;
  }

  return {
    kind: parts[markerIndex] as "p" | "reel" | "tv",
    code: parts[markerIndex + 1],
  };
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

  const embeddedAbsoluteUrl = extractAbsoluteUrlFromText(input.video_embed);
  if (embeddedAbsoluteUrl) {
    return embeddedAbsoluteUrl;
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

  if (/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(parsedUrl.pathname)) {
    return parsedUrl.toString();
  }

  return null;
}

export async function resolvePortfolioThumbnailUrlFromRemote(input: PortfolioMediaInput) {
  const syncResult = resolvePortfolioThumbnailUrl(input);
  if (syncResult) {
    return syncResult;
  }

  const source = resolvePortfolioSourceUrl(input);
  const parsedUrl = parseUrl(source);

  if (!parsedUrl) {
    return null;
  }

  const metadataThumbnail = await fetchRemoteThumbnailByMetadata(parsedUrl);

  if (metadataThumbnail) {
    return metadataThumbnail;
  }

  const instagramPost = extractInstagramPost(parsedUrl);

  if (instagramPost) {
    return `https://www.instagram.com/${instagramPost.kind}/${instagramPost.code}/media/?size=l`;
  }

  return null;
}

export function withResolvedPortfolioThumbnail<T extends PortfolioMediaInput>(item: T): T {
  return {
    ...item,
    thumbnail_url: resolvePortfolioThumbnailUrl(item),
  } as T;
}
