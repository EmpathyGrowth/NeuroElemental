"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, Mail } from "lucide-react";
import { getBlogPost, getRelatedPosts } from "@/lib/blog-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { use } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { formatDate, DATE_FORMATS } from "@/lib/utils";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// This must be dynamic since we're using client features
export default function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = use(params);
  const post = getBlogPost(slug);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(slug, post.category);

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-[#764BA2] origin-left z-50"
        style={{ scaleX }}
      />
      <article className="container mx-auto px-4 py-16 max-w-4xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-primary hover:text-blue-700 mb-8 font-medium"
        >
          ← Back to Blog
        </Link>

        <div className="glass-card rounded-2xl p-8 md:p-12 mb-8">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-full">
              {post.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  fill
                  className="rounded-full object-cover"
                  sizes="48px"
                />
              </div>
              <div>
                <div className="font-semibold text-foreground">
                  {post.author.name}
                </div>
                <div className="text-sm text-muted-foreground">{post.author.bio}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(post.date, DATE_FORMATS.LONG)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </div>
            </div>
          </div>

          <div className="relative h-96 rounded-xl overflow-hidden mb-12">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
              priority
            />
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-foreground/80 leading-relaxed mb-8 font-medium">
              {post.excerpt}
            </p>

            {post.content?.sections.map((section, index) => (
              <div key={index} className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-foreground">
                  {section.heading}
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}

            {!post.content && (
              <div className="space-y-6 text-foreground/80 leading-relaxed">
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

          <div className="mt-12 p-6 bg-blue-50 rounded-xl border-l-4 border-blue-600">
            <div className="flex items-start gap-3">
              <div className="text-3xl">💡</div>
              <div>
                <h3 className="font-bold text-foreground mb-2">Key Takeaway</h3>
                <p className="text-foreground/80">
                  Remember, everyone is a mix of all 6 elements. Your dominant
                  patterns provide insight, but you're not limited to one way of
                  being.
                </p>
              </div>
            </div>
          </div>
        </div>

        {relatedPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-foreground">
              Related Posts
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`/blog/${relatedPost.slug}`}
                >
                  <div className="glass-card rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
                    <div className="relative h-40 overflow-hidden">
                      <Image
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="glass-card rounded-2xl p-8 md:p-12 text-center mb-8">
          <h2 className="text-3xl font-bold mb-4 gradient-text">
            Ready to Decode Your Energy?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get your personalized elemental profile in just 5 minutes.
          </p>
          <Button
            size="lg"
            className="bg-white text-[#667EEA] hover:bg-gray-50 text-lg px-12 py-7 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 font-bold min-h-[56px]"
            asChild
          >
            <Link href="/assessment">
              Start Free Assessment
            </Link>
          </Button>
        </div>

        <div className="glass-card rounded-2xl p-8 md:p-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-foreground">
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
                className="flex-1 h-12 text-lg"
              />
              <Button
                type="submit"
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12"
              >
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-4">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}
