/** @type {import('next').NextConfig} */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

let supabaseHostname = "";
try {
	supabaseHostname = new URL(supabaseUrl).hostname;
} catch {
	supabaseHostname = "";
}

const imageHostnames = [
	supabaseHostname,
	"images.unsplash.com",
	"i.ytimg.com",
	"img.youtube.com",
	"i.postimg.cc",
	"vumbnail.com",
	"www.dailymotion.com",
].filter(Boolean);

const nextConfig = {
	poweredByHeader: false,
	images: {
		formats: ["image/avif", "image/webp"],
		remotePatterns: imageHostnames.map((hostname) => ({
			protocol: "https",
			hostname,
		})),
	},
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{ key: "X-Frame-Options", value: "SAMEORIGIN" },
					{ key: "X-Content-Type-Options", value: "nosniff" },
					{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
					},
					{
						key: "Strict-Transport-Security",
						value: "max-age=63072000; includeSubDomains; preload",
					},
					{
						key: "Content-Security-Policy",
						value:
							"default-src 'self'; base-uri 'self'; frame-ancestors 'self'; object-src 'none'; img-src 'self' data: blob: https:; media-src 'self' blob: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; font-src 'self' data: https:; connect-src 'self' https: wss:; frame-src 'self' https://www.youtube.com https://player.vimeo.com https://www.instagram.com https://www.tiktok.com https://www.dailymotion.com; upgrade-insecure-requests",
					},
				],
			},
		];
	},
};

export default nextConfig;
