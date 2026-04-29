export type PortfolioCategory =
  | "commercial"
  | "music_video"
  | "documentary"
  | "social_media"
  | "motion_graphics"
  | string;

export interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  category: PortfolioCategory | null;
  client: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  video_embed: string | null;
  tags: string[] | null;
  views_count: number | null;
  is_featured: boolean | null;
  display_order: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Service {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  price_range: string | null;
  delivery_days: number | null;
  features: string[] | null;
  is_active: boolean | null;
  display_order: number | null;
}

export interface Testimonial {
  id: string;
  client_name: string;
  client_role: string | null;
  client_avatar: string | null;
  content: string;
  rating: number | null;
  project_type: string | null;
  is_featured: boolean | null;
  created_at: string | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  tags: string[] | null;
  is_published: boolean | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  project_type: string | null;
  budget: string | null;
  status: string | null;
  created_at: string | null;
}

export interface SocialPost {
  id: string;
  platform: string;
  post_url: string | null;
  embed_code: string | null;
  caption: string | null;
  thumbnail_url: string | null;
  likes_count: number | null;
  is_featured: boolean | null;
  posted_at: string | null;
}

export interface SiteStat {
  id: string;
  stat_key: string;
  stat_value: string;
  display_label: string | null;
  updated_at: string | null;
}

export interface DashboardSummary {
  portfolioCount: number;
  serviceCount: number;
  blogCount: number;
  inquiryCount: number;
}
