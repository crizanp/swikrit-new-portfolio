export type ProfileSettings = {
  display_name: string;
  title: string;
  bio: string;
  location_label: string;
  contact_email: string;
  contact_reply_time: string;
  about_intro: string;
  about_paragraph_one: string;
  about_paragraph_two: string;
  about_portrait_url: string;
  cv_bucket: string;
  cv_path: string;
};

export type SocialStatsSettings = {
  instagram_handle: string;
  instagram_followers: string;
  instagram_url: string;
  tiktok_handle: string;
  tiktok_followers: string;
  tiktok_url: string;
  linkedin_handle: string;
  linkedin_followers: string;
  linkedin_url: string;
  youtube_url: string;
  total_views_label: string;
};

export const defaultProfileSettings: ProfileSettings = {
  display_name: "Swikrit Pokhrel",
  title: "Professional Video Editor & Motion Graphics Designer",
  bio: "Cinematic editing and motion design for campaigns that need speed and impact.",
  location_label: "Based in Nepal - Available Worldwide",
  contact_email: "hello@swikritpokhrel.com.np",
  contact_reply_time: "Within 24 hours",
  about_intro:
    "Professional video editor and motion graphics designer creating cinematic, conversion-focused stories for Nepal and global clients.",
  about_paragraph_one:
    "I craft edits that blend emotional storytelling with platform performance. My process combines strategy, pacing, sound, and motion design so each cut feels cinematic while still engineered for retention and engagement.",
  about_paragraph_two:
    "From launch films to social content systems, I collaborate closely with founders, artists, and marketing teams to deliver fast turnarounds without compromising visual quality.",
  about_portrait_url: "https://i.postimg.cc/5t219fvm/Untitled-design-(25).png",
  cv_bucket: "avatars",
  cv_path: "swikrit-cv.pdf",
};

export const defaultSocialStatsSettings: SocialStatsSettings = {
  instagram_handle: "@swikritpokhrel",
  instagram_followers: "24K+",
  instagram_url: "https://instagram.com/swikritpokhrel",
  tiktok_handle: "@swikritpokhrel",
  tiktok_followers: "18K+",
  tiktok_url: "https://tiktok.com/@swikritpokhrel",
  linkedin_handle: "swikrit-pokhrel",
  linkedin_followers: "6K+",
  linkedin_url: "https://linkedin.com/in/swikrit-pokhrel",
  youtube_url: "https://youtube.com",
  total_views_label: "12M+",
};

function readText(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : fallback;
}

function readUrl(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim();

  if (!normalized) {
    return fallback;
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  return `https://${normalized.replace(/^\/+/, "")}`;
}

export function normalizeProfileSettings(
  value?: Partial<ProfileSettings> | null
): ProfileSettings {
  return {
    display_name: readText(value?.display_name, defaultProfileSettings.display_name),
    title: readText(value?.title, defaultProfileSettings.title),
    bio: readText(value?.bio, defaultProfileSettings.bio),
    location_label: readText(value?.location_label, defaultProfileSettings.location_label),
    contact_email: readText(value?.contact_email, defaultProfileSettings.contact_email),
    contact_reply_time: readText(
      value?.contact_reply_time,
      defaultProfileSettings.contact_reply_time
    ),
    about_intro: readText(value?.about_intro, defaultProfileSettings.about_intro),
    about_paragraph_one: readText(
      value?.about_paragraph_one,
      defaultProfileSettings.about_paragraph_one
    ),
    about_paragraph_two: readText(
      value?.about_paragraph_two,
      defaultProfileSettings.about_paragraph_two
    ),
    about_portrait_url: readUrl(
      value?.about_portrait_url,
      defaultProfileSettings.about_portrait_url
    ),
    cv_bucket: readText(value?.cv_bucket, defaultProfileSettings.cv_bucket),
    cv_path: readText(value?.cv_path, defaultProfileSettings.cv_path),
  };
}

export function normalizeSocialStatsSettings(
  value?: Partial<SocialStatsSettings> | null
): SocialStatsSettings {
  return {
    instagram_handle: readText(
      value?.instagram_handle,
      defaultSocialStatsSettings.instagram_handle
    ),
    instagram_followers: readText(
      value?.instagram_followers,
      defaultSocialStatsSettings.instagram_followers
    ),
    instagram_url: readUrl(value?.instagram_url, defaultSocialStatsSettings.instagram_url),
    tiktok_handle: readText(value?.tiktok_handle, defaultSocialStatsSettings.tiktok_handle),
    tiktok_followers: readText(
      value?.tiktok_followers,
      defaultSocialStatsSettings.tiktok_followers
    ),
    tiktok_url: readUrl(value?.tiktok_url, defaultSocialStatsSettings.tiktok_url),
    linkedin_handle: readText(
      value?.linkedin_handle,
      defaultSocialStatsSettings.linkedin_handle
    ),
    linkedin_followers: readText(
      value?.linkedin_followers,
      defaultSocialStatsSettings.linkedin_followers
    ),
    linkedin_url: readUrl(value?.linkedin_url, defaultSocialStatsSettings.linkedin_url),
    youtube_url: readUrl(value?.youtube_url, defaultSocialStatsSettings.youtube_url),
    total_views_label: readText(
      value?.total_views_label,
      defaultSocialStatsSettings.total_views_label
    ),
  };
}
