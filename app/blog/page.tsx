"use client";

import { HeroSection } from "@/components/landing/hero-section";
import { blogPosts, categories, getFeaturedPost } from "@/lib/blog-data";
import { ArrowRight, Calendar, Clock, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Posts");
  const [searchQuery, setSearchQuery] = useState("");

  const featuredPost = getFeaturedPost();
  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === "All Posts" || post.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && !post.featured;
  });

  return (
    <div className="min-h-screen bg-background">

      <HeroSection
        badge="✨ Neurodivergent Insights"
        title={
          <>
            <span className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Insights & Resources
            </span>
          </>
        }
        description="Practical guidance on energy management, neurodivergence, and personal growth."
      >
        <div className="max-w-2xl mx-auto relative mt-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/60 w-5 h-5" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-xl glass-card focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </HeroSection>

      <div className="container mx-auto px-4 pt-16 pb-16 max-w-7xl">
        {featuredPost && searchQuery === "" && (
          <div className="mb-16">
            <Link href={`/blog/${featuredPost.slug}`}>
              <div className="glass-card rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="relative h-64 md:h-full overflow-hidden">
                    <Image
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-full">
                        Featured
                      </span>
                    </div>
                  </div>
                  <div className="p-8 md:py-12 flex flex-col justify-center">
                    <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-sm font-medium rounded-full mb-4 w-fit">
                      {featuredPost.category}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                      <div className="flex items-center gap-2">
                        <div className="relative w-10 h-10">
                          <Image
                            src={featuredPost.author.avatar}
                            alt={featuredPost.author.name}
                            fill
                            className="rounded-full object-cover"
                            sizes="40px"
                          />
                        </div>
                        <span className="font-medium text-foreground/80">
                          {featuredPost.author.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(featuredPost.date)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all">
                      Read More
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-card border border-border text-foreground/80 hover:shadow-md hover:border-primary/50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <article className="glass-card rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group h-full flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-black/70 dark:bg-white/90 backdrop-blur-sm text-white dark:text-black text-xs font-semibold rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8">
                        <Image
                          src={post.author.avatar}
                          alt={post.author.name}
                          fill
                          className="rounded-full object-cover"
                          sizes="32px"
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground/80">
                        {post.author.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    {formatDate(post.date)}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">
              No posts found matching your criteria.
            </p>
          </div>
        )}

        <div className="mt-16 flex justify-center gap-4">
          <Button variant="outline" className="px-6 py-3 glass-card rounded-lg font-medium text-muted-foreground/60 cursor-not-allowed" disabled>
            ← Previous
          </Button>
          <Button className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
            1
          </Button>
          <Button variant="outline" className="px-6 py-3 glass-card rounded-lg font-medium text-foreground/80 hover:shadow-md transition-all">
            2
          </Button>
          <Button variant="outline" className="px-6 py-3 glass-card rounded-lg font-medium text-foreground/80 hover:shadow-md transition-all">
            Next →
          </Button>
        </div>
      </div>

      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#764BA2] to-[#667EEA] animated-gradient" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="glass-card p-12 rounded-3xl shadow-2xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg">
              Ready to Dive Deeper?
            </h2>
            <p className="text-xl mb-10 text-white/90 font-light">
              Get your personalized energy profile in just 5 minutes.
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
        </div>
      </section>
    </div>
  );
}
