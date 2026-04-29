import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getBlogPostBySlug, getRelatedBlogPosts } from "@/lib/data";
import { siteConfig } from "@/lib/constants";
import { buildOgImageUrl, createBreadcrumbJsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export const revalidate = 3600;

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug, true);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const title = `${post.title} | ${siteConfig.name}`;
  const description = post.meta_description ?? post.excerpt ?? "Read the latest article.";
  const url = `${siteConfig.siteUrl}/blog/${post.slug}`;
  const ogImage = buildOgImageUrl(post.title, post.cover_image);

  return {
    title,
    description,
    keywords: post.tags ?? undefined,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostBySlug(params.slug, true);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedBlogPosts(post.slug, post.tags ?? null, 3);
  const shareUrl = `${siteConfig.siteUrl}/blog/${post.slug}`;
  const readTime = Math.max(2, Math.ceil((post.content?.split(/\s+/).length ?? 320) / 200));
  const breadcrumbSchema = createBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.meta_description ?? post.excerpt ?? "",
    image: post.cover_image ? [post.cover_image] : [buildOgImageUrl(post.title)],
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at ?? post.published_at ?? post.created_at,
    author: {
      "@type": "Person",
      name: "Swikrit Pokhrel",
      url: siteConfig.siteUrl,
    },
    publisher: {
      "@type": "Person",
      name: "Swikrit Pokhrel",
      url: siteConfig.siteUrl,
    },
    mainEntityOfPage: shareUrl,
    keywords: post.tags ?? [],
    articleBody: post.content ?? post.excerpt ?? "",
  };

  return (
    <article className="space-y-10 pt-12">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={blogPostingSchema} />
      <section className="container space-y-4">
        <div className="flex flex-wrap gap-2">
          {(post.tags ?? []).map((tag) => (
            <Badge key={`${post.id}-${tag}`} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <h1 className="max-w-4xl text-4xl font-bold sm:text-5xl">{post.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <p>{formatDate(post.published_at ?? post.created_at)}</p>
          <p>{readTime} min read</p>
        </div>
        {post.cover_image ? (
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border/70">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1200px"
              className="object-cover"
            />
          </div>
        ) : null}
      </section>

      <section className="container grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6 text-muted-foreground">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => <h2 className="text-2xl font-semibold text-foreground">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xl font-semibold text-foreground">{children}</h3>,
              p: ({ children }) => <p className="leading-relaxed">{children}</p>,
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noreferrer" className="text-brand underline">
                  {children}
                </a>
              ),
              code: ({ className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || "");
                const codeString = String(children).replace(/\n$/, "");

                if (!match) {
                  return (
                    <code className="rounded bg-secondary/80 px-1.5 py-0.5 text-sm text-foreground" {...props}>
                      {children}
                    </code>
                  );
                }

                return (
                  <SyntaxHighlighter
                    PreTag="div"
                    language={match[1]}
                    style={oneDark}
                    customStyle={{ borderRadius: "0.75rem", padding: "1rem" }}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                );
              },
            }}
          >
            {post.content ?? post.excerpt ?? "Content coming soon."}
          </ReactMarkdown>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <Card className="border-border/70 bg-card/75">
            <CardContent className="space-y-3 p-4">
              <p className="font-medium">Share this post</p>
              <div className="flex flex-wrap gap-2 text-sm">
                <Link
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border/80 px-3 py-1.5 text-muted-foreground hover:text-foreground"
                >
                  LinkedIn
                </Link>
                <Link
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border/80 px-3 py-1.5 text-muted-foreground hover:text-foreground"
                >
                  X / Twitter
                </Link>
                <Link
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border/80 px-3 py-1.5 text-muted-foreground hover:text-foreground"
                >
                  Facebook
                </Link>
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>

      <section className="container space-y-4">
        <h2 className="text-2xl font-semibold">Related posts</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {relatedPosts.map((related) => (
            <article key={related.id} className="rounded-2xl border border-border/70 bg-card/75 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                {formatDate(related.published_at ?? related.created_at)}
              </p>
              <h3 className="mt-2 text-lg font-semibold">{related.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                {related.excerpt ?? "No excerpt available."}
              </p>
              <Link href={`/blog/${related.slug}`} className="mt-3 inline-flex text-sm font-medium text-brand">
                Read article
              </Link>
            </article>
          ))}
        </div>
      </section>
    </article>
  );
}
