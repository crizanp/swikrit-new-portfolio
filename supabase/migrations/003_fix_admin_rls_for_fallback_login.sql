DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'portfolio_items'
  ) THEN
    DROP POLICY IF EXISTS "admin_all_portfolio" ON portfolio_items;
    CREATE POLICY "admin_all_portfolio"
      ON portfolio_items
      FOR ALL
      USING (auth.role() IN ('authenticated', 'anon'))
      WITH CHECK (auth.role() IN ('authenticated', 'anon'));
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'services'
  ) THEN
    DROP POLICY IF EXISTS "admin_all_services" ON services;
    CREATE POLICY "admin_all_services"
      ON services
      FOR ALL
      USING (auth.role() IN ('authenticated', 'anon'))
      WITH CHECK (auth.role() IN ('authenticated', 'anon'));
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'testimonials'
  ) THEN
    DROP POLICY IF EXISTS "admin_all_testimonials" ON testimonials;
    CREATE POLICY "admin_all_testimonials"
      ON testimonials
      FOR ALL
      USING (auth.role() IN ('authenticated', 'anon'))
      WITH CHECK (auth.role() IN ('authenticated', 'anon'));
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'blog_posts'
  ) THEN
    DROP POLICY IF EXISTS "admin_all_blog" ON blog_posts;
    CREATE POLICY "admin_all_blog"
      ON blog_posts
      FOR ALL
      USING (auth.role() IN ('authenticated', 'anon'))
      WITH CHECK (auth.role() IN ('authenticated', 'anon'));
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'contact_inquiries'
  ) THEN
    DROP POLICY IF EXISTS "admin_all_inquiries" ON contact_inquiries;
    CREATE POLICY "admin_all_inquiries"
      ON contact_inquiries
      FOR ALL
      USING (auth.role() IN ('authenticated', 'anon'))
      WITH CHECK (auth.role() IN ('authenticated', 'anon'));
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'social_posts'
  ) THEN
    DROP POLICY IF EXISTS "admin_all_social" ON social_posts;
    CREATE POLICY "admin_all_social"
      ON social_posts
      FOR ALL
      USING (auth.role() IN ('authenticated', 'anon'))
      WITH CHECK (auth.role() IN ('authenticated', 'anon'));
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'site_stats'
  ) THEN
    DROP POLICY IF EXISTS "admin_all_stats" ON site_stats;
    CREATE POLICY "admin_all_stats"
      ON site_stats
      FOR ALL
      USING (auth.role() IN ('authenticated', 'anon'))
      WITH CHECK (auth.role() IN ('authenticated', 'anon'));
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'site_settings'
  ) THEN
    DROP POLICY IF EXISTS "admin_all_site_settings" ON site_settings;
    CREATE POLICY "admin_all_site_settings"
      ON site_settings
      FOR ALL
      USING (auth.role() IN ('authenticated', 'anon'))
      WITH CHECK (auth.role() IN ('authenticated', 'anon'));
  END IF;
END $$;
