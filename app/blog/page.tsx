"use client";

import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { BlogPostWithAuthor } from "@/lib/db/blog";
import { formatDate } from "@/lib/utils";
import { ArrowRight, Calendar, CheckCircle, Clock, Loader2, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const POSTS_PER_PAGE = 6;

// Default author info for fallback
const DEFAULT_AUTHOR = {
  full_name: "Jannik Laursen",
  avatar_url: "/images/avatars/jannik-laursen.jpg",
};

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Posts");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState<BlogPostWithAuthor[]>([]);
  const [featuredPost, setFeaturedPost] = useState<BlogPostWithAuthor | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch blog posts from API
  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        setError(null);

        // Fetch featured post
        const featuredRes = await fetch('/api/blog?featured=true');
        if (featuredRes.ok) {
          const featuredData = await featuredRes.json();
          setFeaturedPost(featuredData.post);
        }

        // Fetch all posts
        const postsRes = await fetch('/api/blog');
        if (!postsRes.ok) {
          throw new Error('Failed to fetch blog posts');
        }
        const postsData = await postsRes.json();
        setPosts(postsData.posts || []);
        setCategories(['All Posts', ...(postsData.categories || [])]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  // Filter posts based on category and search
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === "All Posts" || post.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
      // Exclude featured post from the grid
      const isNotFeatured = !featuredPost || post.id !== featuredPost.id;
      return matchesCategory && matchesSearch && isNotFeatured;
    });
  }, [posts, selectedCategory, searchQuery, featuredPost]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  // Reset to page 1 when filters change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Helper to get author display info
  const getAuthorInfo = (post: BlogPostWithAuthor) => {
    return {
      name: post.author?.full_name || DEFAULT_AUTHOR.full_name,
      avatar: post.author?.avatar_url || DEFAULT_AUTHOR.avatar_url,
    };
  };

  // Calculate stats
  const totalPosts = posts.length;
  const totalCategories = Math.max(0, categories.length - 1); // Exclude "All Posts"

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        badge="📝 Insights & Resources"
        title={
          <>
            Explore <span className="gradient-text">Our Blog</span>
          </>
        }
        description="Practical guidance on energy management, neurodivergence, and personal growth from experts in the field."
      >
        <div className="flex flex-wrap justify-center gap-6 text-sm mt-8">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span>Research-backed insights</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span>Practical strategies</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span>Expert perspectives</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-5xl mx-auto">
          <Card className="glass-card text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold gradient-text mb-1">
                {loading ? <span className="animate-pulse">--</span> : totalPosts}
              </div>
              <div className="text-sm text-muted-foreground">Articles</div>
            </CardContent>
          </Card>
          <Card className="glass-card text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold gradient-text mb-1">
                {loading ? <span className="animate-pulse">--</span> : totalCategories}
              </div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </CardContent>
          </Card>
          <Card className="glass-card text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold gradient-text mb-1">Weekly</div>
              <div className="text-sm text-muted-foreground">New Content</div>
            </CardContent>
          </Card>
          <Card className="glass-card text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold gradient-text mb-1">Free</div>
              <div className="text-sm text-muted-foreground">Always</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto relative mt-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/60 w-5 h-5" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-4 py-4 rounded-xl glass-card focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
            aria-label="Search articles"
          />
        </div>
      </HeroSection>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading posts...</span>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-xl text-destructive">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      ) : (
        <>
          {/* Featured Post */}
          {featuredPost && searchQuery === "" && selectedCategory === "All Posts" && (
            <section className="py-12 bg-background/50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-2">Featured Article</h2>
                  <p className="text-muted-foreground">Our latest must-read content</p>
                </div>

                <Link href={`/blog/${featuredPost.slug}`}>
                  <Card className="glass-card hover:shadow-xl transition-all duration-300 cursor-pointer group border-primary/30">
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="relative h-64 md:h-full min-h-[300px] overflow-hidden rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
                        <Image
                          src={featuredPost.featured_image_url || '/images/blog/default.svg'}
                          alt={featuredPost.title || ''}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-primary text-primary-foreground">
                            Featured
                          </Badge>
                        </div>
                      </div>
                      <div className="p-8 md:py-12 flex flex-col justify-center">
                        <Badge variant="secondary" className="w-fit mb-4">
                          {featuredPost.category}
                        </Badge>
                        <CardTitle className="text-2xl md:text-3xl mb-4 group-hover:text-primary transition-colors leading-tight">
                          {featuredPost.title}
                        </CardTitle>
                        <CardDescription className="text-base mb-6 leading-relaxed line-clamp-3">
                          {featuredPost.excerpt}
                        </CardDescription>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                          <div className="flex items-center gap-2">
                            <div className="relative w-10 h-10">
                              <Image
                                src={getAuthorInfo(featuredPost).avatar}
                                alt={getAuthorInfo(featuredPost).name}
                                fill
                                className="rounded-full object-cover"
                                sizes="40px"
                              />
                            </div>
                            <span className="font-medium">
                              {getAuthorInfo(featuredPost).name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(featuredPost.published_at || featuredPost.created_at || '')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            5 min read
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all">
                          Read Article
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            </section>
          )}

          {/* Category Filters */}
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap gap-3 justify-center">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => handleCategoryChange(category)}
                    className={selectedCategory === category ? "bg-gradient-to-r from-primary to-[#764BA2]" : ""}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </section>

          {/* Blog Posts Grid */}
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">
                  {selectedCategory === "All Posts" ? "All Articles" : selectedCategory}
                </h2>
                <p className="text-muted-foreground">
                  {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>

              {filteredPosts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-xl text-muted-foreground">
                    No posts found matching your criteria.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All Posts");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {paginatedPosts.map((post) => {
                    const authorInfo = getAuthorInfo(post);
                    return (
                      <Card key={post.id} className="glass-card hover:shadow-xl transition-all duration-300 flex flex-col group">
                        <div className="relative h-48 overflow-hidden rounded-t-lg">
                          <Image
                            src={post.featured_image_url || '/images/blog/default.svg'}
                            alt={post.title || ''}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                          <div className="absolute top-4 left-4">
                            <Badge variant="secondary">
                              {post.category}
                            </Badge>
                          </div>
                        </div>
                        <CardHeader className="pb-3">
                          <Link href={`/blog/${post.slug}`}>
                            <CardTitle className="text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2 cursor-pointer hover:underline">
                              {post.title}
                            </CardTitle>
                          </Link>
                        </CardHeader>
                        <CardContent className="flex-grow pb-3">
                          <CardDescription className="text-sm leading-relaxed line-clamp-3 mb-4">
                            {post.excerpt}
                          </CardDescription>
                          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(post.published_at || post.created_at || '')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>5 min read</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-2">
                            <div className="relative w-8 h-8">
                              <Image
                                src={authorInfo.avatar}
                                alt={authorInfo.name}
                                fill
                                className="rounded-full object-cover"
                                sizes="32px"
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {authorInfo.name}
                            </span>
                          </div>
                          <Link href={`/blog/${post.slug}`}>
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
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-16 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      className={currentPage === page ? "bg-gradient-to-r from-primary to-[#764BA2]" : ""}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </Button>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-background/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="glass-card border-primary/50 p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to understand your energy?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Take our free assessment to discover your unique Element Mix and get personalized insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/assessment">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-[#764BA2]">
                  Take Free Assessment
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Browse Courses
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
