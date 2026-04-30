INSERT INTO site_settings (setting_key, setting_value)
VALUES (
  'profile',
  jsonb_build_object(
    'display_name', 'Swikrit Pokhrel',
    'title', 'Professional Video Editor & Motion Graphics Designer',
    'bio', 'Cinematic editing and motion design for campaigns that need speed and impact.',
    'location_label', 'Based in Nepal - Available Worldwide',
    'contact_email', 'hello@swikritpokhrel.com.np',
    'contact_reply_time', 'Within 24 hours',
    'about_intro', 'Professional video editor and motion graphics designer creating cinematic, conversion-focused stories for Nepal and global clients.',
    'about_paragraph_one', 'I craft edits that blend emotional storytelling with platform performance. My process combines strategy, pacing, sound, and motion design so each cut feels cinematic while still engineered for retention and engagement.',
    'about_paragraph_two', 'From launch films to social content systems, I collaborate closely with founders, artists, and marketing teams to deliver fast turnarounds without compromising visual quality.',
    'about_portrait_url', 'https://i.postimg.cc/5t219fvm/Untitled-design-(25).png',
    'cv_bucket', 'avatars',
    'cv_path', 'swikrit-cv.pdf'
  )
)
ON CONFLICT (setting_key)
DO UPDATE SET
  setting_value = EXCLUDED.setting_value || site_settings.setting_value,
  updated_at = now();

INSERT INTO site_settings (setting_key, setting_value)
VALUES (
  'social_stats',
  jsonb_build_object(
    'instagram_handle', '@swikritpokhrel',
    'instagram_followers', '24K+',
    'instagram_url', 'https://instagram.com/swikritpokhrel',
    'tiktok_handle', '@swikritpokhrel',
    'tiktok_followers', '18K+',
    'tiktok_url', 'https://tiktok.com/@swikritpokhrel',
    'linkedin_handle', 'swikrit-pokhrel',
    'linkedin_followers', '6K+',
    'linkedin_url', 'https://linkedin.com/in/swikrit-pokhrel',
    'youtube_url', 'https://youtube.com',
    'total_views_label', '12M+'
  )
)
ON CONFLICT (setting_key)
DO UPDATE SET
  setting_value = EXCLUDED.setting_value || site_settings.setting_value,
  updated_at = now();
