ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS read_time integer DEFAULT 4;

ALTER TABLE social_posts
  ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'site_settings'
      AND policyname = 'admin_all_site_settings'
  ) THEN
    CREATE POLICY "admin_all_site_settings"
      ON site_settings
      FOR ALL
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

INSERT INTO site_settings (setting_key, setting_value)
VALUES (
  'profile',
  jsonb_build_object(
    'display_name', 'Swikrit Pokhrel',
    'bio', ''
  )
)
ON CONFLICT (setting_key) DO NOTHING;
