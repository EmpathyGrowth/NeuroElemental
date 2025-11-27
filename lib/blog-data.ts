export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  date: string;
  readTime: string;
  featured: boolean;
  image: string;
  content?: {
    sections: {
      heading: string;
      content: string;
    }[];
  };
}

export const blogPosts: BlogPost[] = [
  {
    slug: "adhd-burnout-energy-perspective",
    title: "ADHD Burnout: An Energy Perspective",
    excerpt: "Why traditional advice about burnout doesn't work for ADHD brains—and what actually helps. Understanding the 0-to-300 pattern and sustainable energy management.",
    category: "Neurodivergence",
    author: {
      name: "Dr. Sarah Chen",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200",
      bio: "Neuroscience researcher and energy management specialist focusing on neurodivergent populations."
    },
    date: "2024-11-15",
    readTime: "8 min read",
    featured: true,
    image: "https://images.unsplash.com/photo-1559305616-3f99cd43e353?auto=format&fit=crop&w=1200&q=80",
    content: {
      sections: [
        {
          heading: "What is ADHD Burnout?",
          content: "ADHD burnout is a state of physical, mental, and emotional exhaustion that occurs when the demands of managing ADHD symptoms exceed your available energy resources. Unlike typical burnout, ADHD burnout has unique characteristics rooted in how ADHD brains process motivation, attention, and reward."
        },
        {
          heading: "The 0-to-300 Pattern",
          content: "ADHD energy doesn't flow steadily. It's characterized by intense periods of hyperfocus (300) followed by complete depletion (0). This isn't laziness or poor willpower—it's how ADHD brains are wired. The neurotransmitter dopamine, which regulates motivation and reward, functions differently in ADHD brains, creating this all-or-nothing energy pattern."
        },
        {
          heading: "The Role of Dopamine",
          content: "Research shows that ADHD brains have lower baseline dopamine levels and altered dopamine receptor function. This means activities need to be more stimulating or novel to generate the same level of motivation and engagement that neurotypical brains experience with routine tasks. When dopamine runs low, everything feels impossible—not because you're not trying hard enough, but because your brain literally lacks the neurochemical fuel it needs."
        },
        {
          heading: "Why Traditional Rest Doesn't Work",
          content: "Here's the paradox: when an ADHD brain is understimulated, rest can feel worse than work. You've probably experienced this—lying on the couch feeling guilty about not doing tasks, but also feeling too depleted to do them. Traditional rest advice assumes a neurotypical nervous system that finds calm restful. For ADHD brains, the right kind of 'rest' often involves gentle stimulation, not complete stillness."
        },
        {
          heading: "Energy Management for ADHD",
          content: "Effective ADHD energy management requires understanding your unique stimulation needs. This means: tracking your energy patterns throughout the day, identifying activities that genuinely recharge you (even if they don't look like 'rest'), building in transition time between tasks, using body doubling or accountability partners, and most importantly—ditching the guilt about needing different strategies than neurotypical people."
        },
        {
          heading: "The Importance of Passion Projects",
          content: "ADHD brains are designed to hyperfocus on things they find genuinely interesting. This isn't a bug—it's a feature. However, not all stimulation is sustainable. Doomscrolling provides dopamine hits but drains energy. Passion projects that align with your values and interests provide dopamine AND build energy reserves. The key is distinguishing between sustainable stimulation (creative projects, physical activity, meaningful conversations) and unsustainable stimulation (social media, drama, emergency-driven work)."
        },
        {
          heading: "Your Energy Pattern Is Not a Flaw",
          content: "The most important thing to understand about ADHD burnout is this: your energy pattern is not a moral failing. It's a neurological difference that requires different strategies. When you stop trying to force yourself into neurotypical energy management systems and start working with your actual brain, recovery becomes possible. The NeuroElemental framework can help you identify which activities genuinely regenerate your specific nervous system, rather than following generic advice that wasn't designed for ADHD brains in the first place."
        }
      ]
    }
  },
  {
    slug: "three-types-regeneration",
    title: "The 3 Types of Regeneration Every Person Needs",
    excerpt: "Physical rest isn't enough. Learn about the three essential types of regeneration and why you need all of them to avoid burnout.",
    category: "Energy Management",
    author: {
      name: "Dr. Sarah Chen",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200",
      bio: "Neuroscience researcher and energy management specialist focusing on neurodivergent populations."
    },
    date: "2024-11-10",
    readTime: "6 min read",
    featured: false,
    image: "https://images.pexels.com/photos/3822843/pexels-photo-3822843.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    slug: "personality-tests-fall-short",
    title: "Why Traditional Personality Tests Fall Short",
    excerpt: "MBTI, Enneagram, Big 5—they all miss something crucial. Here's what standard personality frameworks don't account for.",
    category: "Framework Guide",
    author: {
      name: "Marcus Rivera",
      avatar: "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=200",
      bio: "Psychology researcher specializing in individual differences and assessment methodology."
    },
    date: "2024-11-05",
    readTime: "7 min read",
    featured: false,
    image: "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    slug: "understanding-sensory-processing",
    title: "Understanding Your Sensory Processing Needs",
    excerpt: "Why some people need silence to focus while others need background noise. A deep dive into sensory processing differences.",
    category: "Neurodivergence",
    author: {
      name: "Dr. Sarah Chen",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200",
      bio: "Neuroscience researcher and energy management specialist focusing on neurodivergent populations."
    },
    date: "2024-10-28",
    readTime: "9 min read",
    featured: false,
    image: "https://images.pexels.com/photos/3771115/pexels-photo-3771115.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    slug: "supporting-elements-in-conflict",
    title: "How to Support Each Element in Conflict",
    excerpt: "Different elements need different things when stressed. Learn how to recognize and respond to conflict across the spectrum.",
    category: "Relationships",
    author: {
      name: "Jamie Torres",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200",
      bio: "Relationship therapist and conflict resolution specialist working with neurodivergent couples."
    },
    date: "2024-10-20",
    readTime: "10 min read",
    featured: false,
    image: "https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    slug: "science-behind-elements",
    title: "The Science Behind the Elements",
    excerpt: "Neurotransmitters, genetics, and sensory processing—the research foundations of the NeuroElemental framework.",
    category: "Science",
    author: {
      name: "Dr. Sarah Chen",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200",
      bio: "Neuroscience researcher and energy management specialist focusing on neurodivergent populations."
    },
    date: "2024-10-15",
    readTime: "12 min read",
    featured: false,
    image: "https://images.pexels.com/photos/3825517/pexels-photo-3825517.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    slug: "neurodivergence-energy-management",
    title: "Neurodivergence and Energy Management",
    excerpt: "How ADHD, autism, and other neurodivergent traits affect your energy patterns—and what to do about it.",
    category: "Neurodivergence",
    author: {
      name: "Dr. Sarah Chen",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200",
      bio: "Neuroscience researcher and energy management specialist focusing on neurodivergent populations."
    },
    date: "2024-10-08",
    readTime: "11 min read",
    featured: false,
    image: "https://images.pexels.com/photos/3760607/pexels-photo-3760607.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    slug: "relationships-across-elements",
    title: "Building Relationships Across Different Elements",
    excerpt: "What happens when an Electric person partners with a Grounded one? Understanding and honoring elemental differences in relationships.",
    category: "Relationships",
    author: {
      name: "Jamie Torres",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200",
      bio: "Relationship therapist and conflict resolution specialist working with neurodivergent couples."
    },
    date: "2024-10-01",
    readTime: "8 min read",
    featured: false,
    image: "https://images.pexels.com/photos/4629631/pexels-photo-4629631.jpeg?auto=compress&cs=tinysrgb&w=800"
  }
];

export const categories = [
  "All Posts",
  "Energy Management",
  "Neurodivergence",
  "Relationships",
  "Science",
  "Framework Guide"
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

export function getFilteredPosts(category: string): BlogPost[] {
  if (category === "All Posts") {
    return blogPosts;
  }
  return blogPosts.filter(post => post.category === category);
}

export function getFeaturedPost(): BlogPost | undefined {
  return blogPosts.find(post => post.featured);
}

export function getRelatedPosts(currentSlug: string, category: string, limit: number = 3): BlogPost[] {
  return blogPosts
    .filter(post => post.slug !== currentSlug && post.category === category)
    .slice(0, limit);
}
