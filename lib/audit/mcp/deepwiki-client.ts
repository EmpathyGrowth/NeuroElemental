/**
 * DeepWiki MCP Client Wrapper
 * 
 * Wraps DeepWiki MCP server functions for best practices research.
 * Provides caching and query utilities for framework documentation.
 */

/**
 * Best practice recommendation
 */
export interface BestPractice {
  framework: string;
  topic: string;
  recommendation: string;
  source?: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Pattern validation result
 */
export interface PatternValidation {
  pattern: string;
  isValid: boolean;
  recommendation?: string;
  modernAlternative?: string;
}

/**
 * Framework repositories for DeepWiki queries
 */
export const FRAMEWORK_REPOS = {
  nextjs: 'vercel/next.js',
  tailwind: 'tailwindlabs/tailwindcss',
  react: 'facebook/react',
  supabase: 'supabase/supabase',
} as const;

export type Framework = keyof typeof FRAMEWORK_REPOS;

/**
 * Common best practice questions by framework
 */
export const BEST_PRACTICE_QUESTIONS: Record<Framework, string[]> = {
  nextjs: [
    'What are the best practices for App Router in Next.js 14+?',
    'How should server components and client components be organized?',
    'What are the recommended patterns for data fetching in App Router?',
    'How should caching be configured in Next.js App Router?',
    'What are the best practices for middleware in Next.js?',
    'How should API routes be structured in App Router?',
  ],
  tailwind: [
    'What are the best practices for Tailwind CSS v4?',
    'How should CSS variables be used with Tailwind?',
    'What are the recommended patterns for responsive design?',
    'How should custom themes be configured?',
    'What are the best practices for dark mode?',
  ],
  react: [
    'What are the best practices for React 19?',
    'How should hooks be organized and used?',
    'What are the recommended patterns for state management?',
    'How should effects be used properly?',
    'What are the best practices for component composition?',
  ],
  supabase: [
    'What are the best practices for Supabase authentication?',
    'How should Row Level Security policies be structured?',
    'What are the recommended patterns for database queries?',
    'How should real-time subscriptions be managed?',
    'What are the best practices for Supabase Edge Functions?',
  ],
};

/**
 * Cache for DeepWiki responses
 */
const responseCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

/**
 * DeepWiki MCP Client
 */
export class DeepWikiMCPClient {
  /**
   * Get cache key for a query
   */
  static getCacheKey(repoName: string, question: string): string {
    return `${repoName}:${question}`;
  }

  /**
   * Check if response is cached and valid
   */
  static getCachedResponse(repoName: string, question: string): string | null {
    const key = this.getCacheKey(repoName, question);
    const cached = responseCache.get(key);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.response;
    }

    return null;
  }

  /**
   * Cache a response
   */
  static cacheResponse(repoName: string, question: string, response: string): void {
    const key = this.getCacheKey(repoName, question);
    responseCache.set(key, { response, timestamp: Date.now() });
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    responseCache.clear();
  }

  /**
   * Get repository name for a framework
   */
  static getRepoName(framework: Framework): string {
    return FRAMEWORK_REPOS[framework];
  }

  /**
   * Get best practice questions for a framework
   */
  static getQuestions(framework: Framework): string[] {
    return BEST_PRACTICE_QUESTIONS[framework];
  }

  /**
   * Parse best practice from DeepWiki response
   */
  static parseBestPractice(
    framework: Framework,
    topic: string,
    response: string
  ): BestPractice {
    return {
      framework,
      topic,
      recommendation: response,
      source: FRAMEWORK_REPOS[framework],
      confidence: response.length > 100 ? 'high' : response.length > 50 ? 'medium' : 'low',
    };
  }

  /**
   * Extract key recommendations from response
   */
  static extractRecommendations(response: string): string[] {
    const recommendations: string[] = [];

    // Look for bullet points or numbered lists
    const lines = response.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.startsWith('- ') ||
        trimmed.startsWith('* ') ||
        /^\d+\.\s/.test(trimmed)
      ) {
        const content = trimmed.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '');
        if (content.length > 10) {
          recommendations.push(content);
        }
      }
    }

    return recommendations;
  }

  /**
   * Check if a pattern matches best practices
   */
  static validatePattern(
    pattern: string,
    bestPractices: BestPractice[]
  ): PatternValidation {
    const patternLower = pattern.toLowerCase();

    // Check against known anti-patterns
    const antiPatterns: Record<string, { description: string; alternative: string }> = {
      'getserversideprops': {
        description: 'getServerSideProps is legacy Pages Router pattern',
        alternative: 'Use server components or route handlers in App Router',
      },
      'getstaticprops': {
        description: 'getStaticProps is legacy Pages Router pattern',
        alternative: 'Use server components with fetch caching in App Router',
      },
      'useeffect.*fetch': {
        description: 'Fetching data in useEffect is not recommended',
        alternative: 'Use server components or React Query/SWR for client-side fetching',
      },
      'dangerouslysetinnerhtml': {
        description: 'dangerouslySetInnerHTML can be a security risk',
        alternative: 'Use a sanitization library or structured content',
      },
      '@apply': {
        description: '@apply can lead to large CSS bundles in Tailwind',
        alternative: 'Use utility classes directly or create components',
      },
    };

    for (const [antiPattern, info] of Object.entries(antiPatterns)) {
      if (new RegExp(antiPattern, 'i').test(patternLower)) {
        return {
          pattern,
          isValid: false,
          recommendation: info.description,
          modernAlternative: info.alternative,
        };
      }
    }

    // Check if pattern is mentioned positively in best practices
    for (const bp of bestPractices) {
      if (bp.recommendation.toLowerCase().includes(patternLower)) {
        return {
          pattern,
          isValid: true,
          recommendation: `Pattern aligns with ${bp.framework} best practices`,
        };
      }
    }

    return {
      pattern,
      isValid: true,
      recommendation: 'No specific guidance found for this pattern',
    };
  }
}

/**
 * Common patterns to check for each framework
 */
export const PATTERNS_TO_CHECK: Record<Framework, string[]> = {
  nextjs: [
    'use client',
    'use server',
    'generateStaticParams',
    'generateMetadata',
    'loading.tsx',
    'error.tsx',
    'not-found.tsx',
    'route.ts',
    'middleware.ts',
  ],
  tailwind: [
    'theme.extend',
    'darkMode',
    '@layer',
    'CSS variables',
    'arbitrary values',
  ],
  react: [
    'useState',
    'useEffect',
    'useCallback',
    'useMemo',
    'useRef',
    'useContext',
    'forwardRef',
  ],
  supabase: [
    'createClient',
    'createServerClient',
    'RLS policies',
    'auth.getUser',
    'realtime',
  ],
};

/**
 * Get all patterns to check for a framework
 */
export function getPatternsToCheck(framework: Framework): string[] {
  return PATTERNS_TO_CHECK[framework];
}

/**
 * Check if code uses modern patterns
 */
export function usesModernPatterns(
  code: string,
  framework: Framework
): { modern: string[]; legacy: string[] } {
  const modern: string[] = [];
  const legacy: string[] = [];

  const modernPatterns: Record<Framework, string[]> = {
    nextjs: ['use client', 'use server', 'generateMetadata', 'generateStaticParams'],
    tailwind: ['theme.extend', 'darkMode: "class"'],
    react: ['useState', 'useCallback', 'useMemo'],
    supabase: ['createServerClient', 'auth.getUser()'],
  };

  const legacyPatterns: Record<Framework, string[]> = {
    nextjs: ['getServerSideProps', 'getStaticProps', 'getInitialProps'],
    tailwind: ['@apply', 'theme.colors'],
    react: ['componentDidMount', 'componentWillUnmount', 'this.state'],
    supabase: ['supabase.auth.session()', 'supabase.auth.user()'],
  };

  for (const pattern of modernPatterns[framework]) {
    if (code.includes(pattern)) {
      modern.push(pattern);
    }
  }

  for (const pattern of legacyPatterns[framework]) {
    if (code.includes(pattern)) {
      legacy.push(pattern);
    }
  }

  return { modern, legacy };
}
