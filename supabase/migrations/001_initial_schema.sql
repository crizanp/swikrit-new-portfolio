CREATE TABLE portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text,
  client text,
  thumbnail_url text,
  video_url text,
  video_embed text,
  tags text[],
  views_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  icon text,
  price_range text,
  delivery_days integer,
  features text[],
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0
);

CREATE TABLE testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  client_role text,
  client_avatar text,
  content text NOT NULL,
  rating integer DEFAULT 5,
  project_type text,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text,
  cover_image text,
  tags text[],
  is_published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE contact_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  project_type text,
  budget text,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  post_url text,
  embed_code text,
  caption text,
  thumbnail_url text,
  likes_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  posted_at timestamptz DEFAULT now()
);

CREATE TABLE site_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_key text UNIQUE NOT NULL,
  stat_value text NOT NULL,
  display_label text,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO site_stats (stat_key, stat_value, display_label) VALUES
('years_experience', '3+', 'Years Experience'),
('projects_done', '150+', 'Projects Done'),
('views_generated', '12M+', 'Views Generated'),
('happy_clients', '80+', 'Happy Clients');

ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_portfolio" ON portfolio_items FOR SELECT USING (true);
CREATE POLICY "public_read_services" ON services FOR SELECT USING (true);
CREATE POLICY "public_read_testimonials" ON testimonials FOR SELECT USING (true);
CREATE POLICY "public_read_published_blogs" ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "public_read_social" ON social_posts FOR SELECT USING (true);
CREATE POLICY "public_read_stats" ON site_stats FOR SELECT USING (true);
CREATE POLICY "public_insert_inquiry" ON contact_inquiries FOR INSERT WITH CHECK (true);

CREATE POLICY "admin_all_portfolio" ON portfolio_items FOR ALL USING (auth.role() IN ('authenticated', 'anon'));
CREATE POLICY "admin_all_services" ON services FOR ALL USING (auth.role() IN ('authenticated', 'anon'));
CREATE POLICY "admin_all_testimonials" ON testimonials FOR ALL USING (auth.role() IN ('authenticated', 'anon'));
CREATE POLICY "admin_all_blog" ON blog_posts FOR ALL USING (auth.role() IN ('authenticated', 'anon'));
CREATE POLICY "admin_all_inquiries" ON contact_inquiries FOR ALL USING (auth.role() IN ('authenticated', 'anon'));
CREATE POLICY "admin_all_social" ON social_posts FOR ALL USING (auth.role() IN ('authenticated', 'anon'));
CREATE POLICY "admin_all_stats" ON site_stats FOR ALL USING (auth.role() IN ('authenticated', 'anon'));
