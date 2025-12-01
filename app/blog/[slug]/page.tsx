"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import DOMPurify from "dompurify";
import { Calendar, Clock, Mail, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/footer";
import { use, useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { formatDate, DATE_FORMATS } from "@/lib/utils";
import type { BlogPostWithAuthor } from "@/lib/db/blog";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// Default author info for fallback
const DEFAULT_AUTHOR = {
  full_name: "Jannik Laursen",
  avatar_url: "/images/avatars/jannik-laursen.jpg",
  bio: "Founder of NeuroElemental, dedicated to helping neurodivergent minds understand and optimize their unique energy patterns.",
};

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPostWithAuthor | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/blog/slug/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            setPost(null);
          } else {
            throw new Error('Failed to fetch blog post');
          }
          return;
        }

        const data = await res.json();
        setPost(data.post);
        setRelatedPosts(data.relatedPosts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

  // Helper to get author display info
  const getAuthorInfo = (blogPost: BlogPostWithAuthor) => {
    return {
      name: blogPost.author?.full_name || DEFAULT_AUTHOR.full_name,
      avatar: blogPost.author?.avatar_url || DEFAULT_AUTHOR.avatar_url,
      bio: DEFAULT_AUTHOR.bio,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading post...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-xl text-destructive mb-4">{error}</p>
        <Button variant="outline" asChild>
          <Link href="/blog">Back to Blog</Link>
        </Button>
      </div>
    );
  }

  if (!post) {
    notFound();
  }

  const authorInfo = getAuthorInfo(post);

  // Parse content if it's JSON (for structured sections)
  let contentSections: { heading: string; content: string }[] = [];
  if (post.content) {
    try {
      const parsed = JSON.parse(post.content);
      if (parsed.sections && Array.isArray(parsed.sections)) {
        contentSections = parsed.sections;
      }
    } catch {
      // Content is plain text, not JSON
    }
  }

  return (
    <div className="min-h-screen">
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-[#764BA2] origin-left z-50"
        style={{ scaleX }}
      />

      {/* Hero Section with Featured Image */}
      {post.featured_image_url && (
        <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
          <Image
            src={post.featured_image_url}
            alt={post.title || ''}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background" />
        </div>
      )}

      <article className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 ${post.featured_image_url ? '-mt-32 relative z-10' : 'pt-24'}`}>
        {/* Back Link */}
        <Link href="/blog" className="inline-block mb-6">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>

        {/* Main Article Card */}
        <Card className="glass-card mb-12">
          <CardHeader className="space-y-6 pb-0">
            {/* Category Badge */}
            <Badge variant="secondary" className="w-fit">
              {post.category}
            </Badge>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              {post.title}
            </h1>

            {/* Author & Meta */}
            <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                  <Image
                    src={authorInfo.avatar}
                    alt={authorInfo.name}
                    fill
                    className="rounded-full object-cover"
                    sizes="48px"
                  />
                </div>
                <div>
                  <div className="font-semibold">{authorInfo.name}</div>
                  <div className="text-sm text-muted-foreground line-clamp-1">{authorInfo.bio}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.published_at || post.created_at || '', DATE_FORMATS.LONG)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  5 min read
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-8">
            {/* Excerpt/Lead */}
            <p className="text-xl text-muted-foreground leading-relaxed mb-8 font-medium">
              {post.excerpt}
            </p>

            {/* Content */}
            <div className="blog-content max-w-none">
              {contentSections.length > 0 ? (
                contentSections.map((section, index) => (
                  <div key={index} className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">
                      {section.heading}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                ))
              ) : post.content ? (
                <div
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
                />
              ) : (
                <div className="space-y-6 text-muted-foreground leading-relaxed">
                  <p>
                    This is a sample blog post demonstrating the NeuroElemental
                    blog layout and structure. Full content will be added as posts
                    are developed.
                  </p>
                  <p>
                    The NeuroElemental framework is designed to help you
                    understand your unique energy patterns and build sustainable
                    practices that work with your nervous system, not against it.
                  </p>
                  <p>
                    Whether you're navigating neurodivergence, managing
                    relationships across different elemental types, or simply
                    looking for more effective energy management strategies, this
                    blog provides practical, research-informed guidance.
                  </p>
                </div>
              )}
            </div>

            {/* Key Takeaway Box */}
            <Card className="mt-12 bg-primary/5 border-l-4 border-primary">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">💡</div>
                  <div>
                    <h3 className="font-bold mb-2">Key Takeaway</h3>
                    <p className="text-muted-foreground">
                      Remember, everyone is a mix of all 6 elements. Your dominant
                      patterns provide insight, but you're not limited to one way of
                      being.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => {
                const relatedAuthorInfo = getAuthorInfo(relatedPost);
                return (
                  <Card key={relatedPost.id} className="glass-card hover:shadow-xl transition-all duration-300 group">
                    <div className="relative h-40 overflow-hidden rounded-t-lg">
                      <Image
                        src={relatedPost.featured_image_url || '/images/blog/default.svg'}
                        alt={relatedPost.title || ''}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <Link href={`/blog/${relatedPost.slug}`}>
                        <CardTitle className="text-base leading-snug group-hover:text-primary transition-colors line-clamp-2 cursor-pointer hover:underline">
                          {relatedPost.title}
                        </CardTitle>
                      </Link>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <CardDescription className="text-sm leading-relaxed line-clamp-2">
                        {relatedPost.excerpt}
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <div className="flex items-center gap-2">
                        <div className="relative w-6 h-6">
                          <Image
                            src={relatedAuthorInfo.avatar}
                            alt={relatedAuthorInfo.name}
                            fill
                            className="rounded-full object-cover"
                            sizes="24px"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {relatedAuthorInfo.name}
                        </span>
                      </div>
                      <Link href={`/blog/${relatedPost.slug}`} className="ml-auto">
                        <Button variant="ghost" size="sm">
                          Read
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* CTA Section */}
        <Card className="glass-card border-primary/50 p-8 md:p-12 text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Decode Your Energy?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get your personalized elemental profile in just 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/assessment">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-[#764BA2]">
                Start Free Assessment
              </Button>
            </Link>
            <Link href="/courses">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Browse Courses
              </Button>
            </Link>
          </div>
        </Card>

        {/* Newsletter Section */}
        <Card className="glass-card p-8 md:p-12 mb-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-4">
              Get weekly insights on energy management
            </h3>
            <p className="text-muted-foreground mb-6">
              Join our newsletter for practical tips, new research, and
              exclusive resources.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-12"
              />
              <Button
                type="submit"
                size="lg"
                className="bg-gradient-to-r from-primary to-[#764BA2] h-12"
              >
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-4">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </Card>
      </article>

      <Footer />
    </div>
  );
}
