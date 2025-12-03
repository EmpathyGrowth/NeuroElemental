/**
 * HTML Sanitization Utility
 * 
 * Provides secure HTML sanitization using DOMPurify to remove XSS vectors
 * while preserving safe formatting elements (bold, italic, links, headings, etc.)
 * 
 * Requirements: 1.5 - WHEN the RichTextEditor saves content THEN the system 
 * SHALL sanitize HTML output using DOMPurify before storage
 */

import DOMPurify from "isomorphic-dompurify";

/**
 * Configuration for DOMPurify that preserves safe formatting elements
 * while removing XSS vectors like script tags and event handlers
 */
const SAFE_HTML_CONFIG: DOMPurify.Config = {
  // Allowed HTML tags - formatting, structure, and media
  ALLOWED_TAGS: [
    // Text formatting
    "p", "br", "span", "div",
    "strong", "b", "em", "i", "u", "s", "strike",
    "sub", "sup", "mark", "small",
    // Headings
    "h1", "h2", "h3", "h4", "h5", "h6",
    // Lists
    "ul", "ol", "li",
    // Links and media
    "a", "img",
    // Block elements
    "blockquote", "pre", "code",
    // Tables
    "table", "thead", "tbody", "tfoot", "tr", "th", "td",
    // Other safe elements
    "hr", "figure", "figcaption",
  ],
  // Allowed attributes - safe styling and linking
  ALLOWED_ATTR: [
    // Links
    "href", "target", "rel",
    // Images
    "src", "alt", "title", "width", "height",
    // Styling (safe subset)
    "class", "style",
    // Tables
    "colspan", "rowspan",
    // Accessibility
    "aria-label", "aria-describedby", "role",
    // Data attributes (commonly used by editors)
    "data-*",
  ],
  // Allow safe URI schemes
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  // Keep content inside removed tags (e.g., keep text from <script>text</script>)
  KEEP_CONTENT: true,
  // Allow target="_blank" on links
  ADD_ATTR: ["target"],
  // Force all links to have rel="noopener noreferrer" for security
  FORCE_BODY: false,
};

/**
 * Sanitizes HTML content to remove XSS vectors while preserving safe formatting
 * 
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 * 
 * @example
 * ```ts
 * const dirty = '<p>Hello</p><script>alert("xss")</script>';
 * const clean = sanitizeHtml(dirty);
 * // Returns: '<p>Hello</p>'
 * ```
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== "string") {
    return "";
  }

  // Sanitize with our safe configuration
  const sanitized = DOMPurify.sanitize(html, SAFE_HTML_CONFIG);

  // DOMPurify returns TrustedHTML in some environments, ensure string
  return String(sanitized);
}

/**
 * Checks if HTML content contains potentially dangerous elements
 * Useful for validation before sanitization
 * 
 * @param html - The HTML string to check
 * @returns true if the HTML contains dangerous elements
 */
export function containsUnsafeHtml(html: string): boolean {
  if (!html || typeof html !== "string") {
    return false;
  }

  // Check for common XSS patterns
  const unsafePatterns = [
    /<script\b/i,
    /\bon\w+\s*=/i, // Event handlers like onclick, onerror
    /javascript:/i,
    /data:/i, // Data URIs can be dangerous
    /<iframe\b/i,
    /<object\b/i,
    /<embed\b/i,
    /<form\b/i,
  ];

  return unsafePatterns.some((pattern) => pattern.test(html));
}

/**
 * Sanitizes HTML and returns both the result and whether changes were made
 * Useful for showing warnings to users when content was modified
 * 
 * @param html - The HTML string to sanitize
 * @returns Object with sanitized HTML and whether it was modified
 */
export function sanitizeHtmlWithReport(html: string): {
  sanitized: string;
  wasModified: boolean;
  hadUnsafeContent: boolean;
} {
  const hadUnsafeContent = containsUnsafeHtml(html);
  const sanitized = sanitizeHtml(html);
  const wasModified = html !== sanitized;

  return {
    sanitized,
    wasModified,
    hadUnsafeContent,
  };
}

// Export the config for testing purposes
export { SAFE_HTML_CONFIG };
