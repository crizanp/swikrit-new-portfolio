import type {
  BlogPost,
  PortfolioItem,
  Service,
  SiteStat,
  SocialPost,
  Testimonial,
} from "@/lib/types";

export const siteConfig = {
  name: "Swikrit Pokhrel",
  title: "Professional Video Editor & Motion Graphics Designer",
  location: "Based in Nepal · Available Worldwide",
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://swikritpokhrel.com.np",
  email: "hello@swikritpokhrel.com.np",
};

export const navigationLinks = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export const socialLinks = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "TikTok", href: "https://tiktok.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "YouTube", href: "https://youtube.com" },
];

export const fallbackStats: SiteStat[] = [
  {
    id: "years_experience",
    stat_key: "years_experience",
    stat_value: "3+",
    display_label: "Years Experience",
    updated_at: null,
  },
  {
    id: "projects_done",
    stat_key: "projects_done",
    stat_value: "150+",
    display_label: "Projects Done",
    updated_at: null,
  },
  {
    id: "views_generated",
    stat_key: "views_generated",
    stat_value: "12M+",
    display_label: "Views Generated",
    updated_at: null,
  },
  {
    id: "happy_clients",
    stat_key: "happy_clients",
    stat_value: "80+",
    display_label: "Happy Clients",
    updated_at: null,
  },
];

export const fallbackPortfolio: PortfolioItem[] = [
  {
    id: "demo-1",
    title: "Launch Film for Global Product Drop",
    description:
      "Narrative-driven commercial edit and motion package built for paid and organic distribution.",
    category: "commercial",
    client: "Tech Startup",
    thumbnail_url: null,
    video_url: null,
    video_embed: null,
    tags: ["Commercial", "Color Grade", "Motion Titles"],
    views_count: 2400000,
    is_featured: true,
    display_order: 1,
    created_at: null,
    updated_at: null,
  },
  {
    id: "demo-2",
    title: "Music Video Post Pipeline",
    description:
      "Fast-cut rhythm edit, cinematic grading, and VFX polish for a regional artist campaign.",
    category: "music_video",
    client: "Independent Artist",
    thumbnail_url: null,
    video_url: null,
    video_embed: null,
    tags: ["Music Video", "Transitions", "Story Cut"],
    views_count: 1800000,
    is_featured: true,
    display_order: 2,
    created_at: null,
    updated_at: null,
  },
  {
    id: "demo-3",
    title: "Social Reel Suite for D2C Brand",
    description:
      "Short-form ad edits and motion graphics templates designed for weekly campaign velocity.",
    category: "social_media",
    client: "Lifestyle Brand",
    thumbnail_url: null,
    video_url: null,
    video_embed: null,
    tags: ["Short Form", "Reels", "UGC Style"],
    views_count: 3400000,
    is_featured: true,
    display_order: 3,
    created_at: null,
    updated_at: null,
  },
];

export const fallbackServices: Service[] = [
  {
    id: "service-1",
    title: "Video Editing",
    description:
      "End-to-end edit for commercials, social campaigns, branded documentaries, and creator content.",
    icon: "clapperboard",
    price_range: "$200 - $2,500",
    delivery_days: 4,
    features: [
      "Story-first edit",
      "Sound design and mix",
      "Platform exports",
    ],
    is_active: true,
    display_order: 1,
  },
  {
    id: "service-2",
    title: "Motion Graphics",
    description:
      "Custom title systems, logo stings, explainers, and social graphics in a clean visual language.",
    icon: "sparkles",
    price_range: "$300 - $3,000",
    delivery_days: 5,
    features: ["2D motion design", "Template kits", "Brand-consistent visuals"],
    is_active: true,
    display_order: 2,
  },
  {
    id: "service-3",
    title: "Short-Form Content Packs",
    description:
      "Batch-edited reels/shorts with hooks, captions, and pacing optimized for retention.",
    icon: "smartphone",
    price_range: "$450 - $1,800",
    delivery_days: 3,
    features: ["Weekly batches", "Caption animations", "Trend-aware pacing"],
    is_active: true,
    display_order: 3,
  },
];

export const fallbackTestimonials: Testimonial[] = [
  {
    id: "testimonial-1",
    client_name: "Aarav Koirala",
    client_role: "Marketing Lead",
    client_avatar: null,
    content:
      "Swikrit elevated our campaign edits far beyond the brief and helped us hit stronger watch-time targets.",
    rating: 5,
    project_type: "commercial",
    is_featured: true,
    created_at: null,
  },
  {
    id: "testimonial-2",
    client_name: "Mina Thapa",
    client_role: "Content Creator",
    client_avatar: null,
    content:
      "Incredible pace, clear communication, and polished motion design. Every reel looked premium.",
    rating: 5,
    project_type: "social_media",
    is_featured: true,
    created_at: null,
  },
];

export const fallbackBlogs: BlogPost[] = [
  {
    id: "blog-1",
    title: "How to Keep Social Ads Fast Without Feeling Rushed",
    slug: "social-ads-fast-without-rushed",
    excerpt:
      "A practical framework for balancing speed, clarity, and visual rhythm in short-form paid content.",
    content: null,
    cover_image: null,
    tags: ["Editing", "Advertising"],
    is_published: true,
    meta_title: null,
    meta_description: null,
    read_time: 5,
    published_at: null,
    created_at: null,
    updated_at: null,
  },
  {
    id: "blog-2",
    title: "Motion Graphics Checklist for Brand Consistency",
    slug: "motion-graphics-brand-consistency-checklist",
    excerpt:
      "A lightweight preflight checklist that keeps animated assets aligned with brand direction.",
    content: null,
    cover_image: null,
    tags: ["Motion Design", "Brand"],
    is_published: true,
    meta_title: null,
    meta_description: null,
    read_time: 4,
    published_at: null,
    created_at: null,
    updated_at: null,
  },
];

export const fallbackSocialPosts: SocialPost[] = [
  {
    id: "social-1",
    platform: "instagram",
    post_url: "https://instagram.com",
    embed_code: null,
    caption: "Behind the scenes from a recent brand campaign edit.",
    thumbnail_url: null,
    likes_count: 1200,
    is_featured: true,
    display_order: 0,
    posted_at: null,
  },
  {
    id: "social-2",
    platform: "linkedin",
    post_url: "https://linkedin.com",
    embed_code: null,
    caption: "Workflow breakdown: from raw footage to polished launch film.",
    thumbnail_url: null,
    likes_count: 860,
    is_featured: true,
    display_order: 1,
    posted_at: null,
  },
];
