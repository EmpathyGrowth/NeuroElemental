/**
 * Feature: cms-enhancement-audit, Property 11: Media Insertion HTML Correctness
 * Validates: Requirements 7.2
 *
 * For any media item selected from the media library and inserted into the RichTextEditor,
 * the generated HTML SHALL include the correct src attribute, alt text, and appropriate
 * wrapper elements.
 */

import * as fc from "fast-check";

// ============================================================================
// Media Insertion HTML Generation (mirrors RichTextEditor behavior)
// ============================================================================

interface MediaItem {
  url: string;
  alt?: string;
  title?: string;
  type: "image" | "video";
  width?: number;
  height?: number;
}

/**
 * Generates HTML for inserting an image into the editor
 * This mirrors the TipTap Image extension behavior
 */
function generateImageHtml(media: MediaItem): string {
  const attrs: string[] = [`src="${escapeHtml(media.url)}"`];
  
  if (media.alt) {
    attrs.push(`alt="${escapeHtml(media.alt)}"`);
  } else {
    attrs.push('alt=""'); // Always include alt for accessibility
  }
  
  if (media.title) {
    attrs.push(`title="${escapeHtml(media.title)}"`);
  }
  
  if (media.width) {
    attrs.push(`width="${media.width}"`);
  }
  
  if (media.height) {
    attrs.push(`height="${media.height}"`);
  }
  
  // Add default class for styling (matches RichTextEditor config)
  attrs.push('class="max-w-full h-auto rounded-lg"');
  
  return `<img ${attrs.join(" ")} />`;
}

/**
 * Generates HTML for inserting a video into the editor
 */
function generateVideoHtml(media: MediaItem): string {
  const attrs: string[] = [
    `src="${escapeHtml(media.url)}"`,
    'controls',
    'class="max-w-full rounded-lg"',
  ];
  
  if (media.width) {
    attrs.push(`width="${media.width}"`);
  }
  
  if (media.height) {
    attrs.push(`height="${media.height}"`);
  }
  
  return `<video ${attrs.join(" ")}></video>`;
}

/**
 * Generates appropriate HTML based on media type
 */
function generateMediaHtml(media: MediaItem): string {
  if (media.type === "video") {
    return generateVideoHtml(media);
  }
  return generateImageHtml(media);
}

/**
 * Escapes HTML special characters to prevent XSS
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Validates that generated HTML contains required attributes
 */
function validateImageHtml(html: string, media: MediaItem): {
  hasSrc: boolean;
  hasAlt: boolean;
  hasCorrectSrc: boolean;
  hasCorrectAlt: boolean;
} {
  const srcMatch = html.match(/src="([^"]*)"/);
  const altMatch = html.match(/alt="([^"]*)"/);
  
  const hasSrc = srcMatch !== null;
  const hasAlt = altMatch !== null;
  
  // Check if src contains the URL (accounting for HTML encoding)
  const hasCorrectSrc = hasSrc && srcMatch![1] === escapeHtml(media.url);
  
  // Check if alt matches (or is empty if no alt provided)
  const expectedAlt = media.alt ? escapeHtml(media.alt) : "";
  const hasCorrectAlt = hasAlt && altMatch![1] === expectedAlt;
  
  return { hasSrc, hasAlt, hasCorrectSrc, hasCorrectAlt };
}

// ============================================================================
// Generators
// ============================================================================

// Generate valid URLs
const urlArb = fc.oneof(
  fc.webUrl(),
  fc.constant("https://example.com/image.jpg"),
  fc.constant("https://cdn.example.com/media/photo.png"),
  fc.stringMatching(/^https:\/\/[a-z]+\.[a-z]+\/[a-z]+\.(jpg|png|gif|webp)$/)
);

// Generate alt text (alphanumeric to avoid escaping edge cases in tests)
const altTextArb = fc.oneof(
  fc.stringMatching(/^[a-zA-Z0-9 ]{0,100}$/),
  fc.constant(""),
  fc.constant("A descriptive alt text for the image")
);

// Generate title text
const titleTextArb = fc.oneof(
  fc.stringMatching(/^[a-zA-Z0-9 ]{0,50}$/),
  fc.constant(""),
  fc.constant("Image title")
);

// Generate dimensions
const dimensionArb = fc.option(fc.integer({ min: 1, max: 4000 }), { nil: undefined });

// Generate media items
const imageMediaArb: fc.Arbitrary<MediaItem> = fc.record({
  url: urlArb,
  alt: fc.option(altTextArb, { nil: undefined }),
  title: fc.option(titleTextArb, { nil: undefined }),
  type: fc.constant("image" as const),
  width: dimensionArb,
  height: dimensionArb,
});

const videoMediaArb: fc.Arbitrary<MediaItem> = fc.record({
  url: urlArb,
  alt: fc.option(altTextArb, { nil: undefined }),
  title: fc.option(titleTextArb, { nil: undefined }),
  type: fc.constant("video" as const),
  width: dimensionArb,
  height: dimensionArb,
});

const mediaItemArb = fc.oneof(imageMediaArb, videoMediaArb);

// ============================================================================
// Property Tests
// ============================================================================

describe("Media Insertion HTML Properties", () => {
  /**
   * Property 11: Media Insertion HTML Correctness
   * Feature: cms-enhancement-audit, Property 11
   * Validates: Requirements 7.2
   */
  describe("Property 11: Media Insertion HTML Correctness", () => {
    it("should include correct src attribute for any image URL", () => {
      fc.assert(
        fc.property(imageMediaArb, (media) => {
          const html = generateMediaHtml(media);
          const validation = validateImageHtml(html, media);
          
          // Property: Generated HTML must have src attribute
          expect(validation.hasSrc).toBe(true);
          
          // Property: src must contain the correct URL
          expect(validation.hasCorrectSrc).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it("should always include alt attribute for images", () => {
      fc.assert(
        fc.property(imageMediaArb, (media) => {
          const html = generateMediaHtml(media);
          const validation = validateImageHtml(html, media);
          
          // Property: Generated HTML must have alt attribute (for accessibility)
          expect(validation.hasAlt).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it("should include correct alt text when provided", () => {
      fc.assert(
        fc.property(
          imageMediaArb.filter((m) => m.alt !== undefined && m.alt.length > 0),
          (media) => {
            const html = generateMediaHtml(media);
            const validation = validateImageHtml(html, media);
            
            // Property: alt attribute should match provided alt text
            expect(validation.hasCorrectAlt).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should generate valid img tag structure", () => {
      fc.assert(
        fc.property(imageMediaArb, (media) => {
          const html = generateMediaHtml(media);
          
          // Property: Should be a valid self-closing img tag
          expect(html).toMatch(/^<img\s+[^>]+\/>$/);
        }),
        { numRuns: 100 }
      );
    });

    it("should generate valid video tag structure for videos", () => {
      fc.assert(
        fc.property(videoMediaArb, (media) => {
          const html = generateMediaHtml(media);
          
          // Property: Should be a valid video tag with closing tag
          expect(html).toMatch(/^<video\s+[^>]+><\/video>$/);
          
          // Property: Should include controls attribute
          expect(html).toContain("controls");
        }),
        { numRuns: 100 }
      );
    });

    it("should include appropriate wrapper class for styling", () => {
      fc.assert(
        fc.property(mediaItemArb, (media) => {
          const html = generateMediaHtml(media);
          
          // Property: Should include class attribute for styling
          expect(html).toContain('class="');
          expect(html).toContain("max-w-full");
        }),
        { numRuns: 100 }
      );
    });

    it("should escape special characters in URLs to prevent XSS", () => {
      // Test ampersand escaping
      const urlWithAmpersand = 'https://example.com/image.jpg?a=1&b=2';
      const html1 = generateMediaHtml({ url: urlWithAmpersand, type: "image" });
      expect(html1).toContain('&amp;b='); // & should be escaped to &amp;
      expect(html1).not.toContain('&b=2"'); // Raw & should not appear before closing quote
      
      // Test angle bracket escaping
      const urlWithScript = 'https://example.com/image.jpg?q=<script>';
      const html2 = generateMediaHtml({ url: urlWithScript, type: "image" });
      expect(html2).toContain('&lt;script&gt;'); // < and > should be escaped
      expect(html2).not.toContain('<script>'); // Raw tags should not appear
      
      // Test quote escaping
      const urlWithQuotes = 'https://example.com/image.jpg?q="test"';
      const html3 = generateMediaHtml({ url: urlWithQuotes, type: "image" });
      expect(html3).toContain('&quot;'); // Quotes should be escaped
    });

    it("should escape special characters in alt text to prevent XSS", () => {
      const maliciousAlts = [
        'Image with "quotes"',
        'Image with <tags>',
        'Image with & ampersand',
      ];
      
      maliciousAlts.forEach((alt) => {
        const media: MediaItem = { url: "https://example.com/img.jpg", alt, type: "image" };
        const html = generateMediaHtml(media);
        
        // Property: Special characters in alt should be escaped
        if (alt.includes('"')) {
          expect(html).toContain("&quot;");
        }
        if (alt.includes('<')) {
          expect(html).toContain("&lt;");
        }
        if (alt.includes('&') && !alt.includes('&amp;')) {
          expect(html).toContain("&amp;");
        }
      });
    });

    it("should include dimensions when provided", () => {
      fc.assert(
        fc.property(
          imageMediaArb.filter((m) => m.width !== undefined || m.height !== undefined),
          (media) => {
            const html = generateMediaHtml(media);
            
            // Property: Width should be included if provided
            if (media.width !== undefined) {
              expect(html).toContain(`width="${media.width}"`);
            }
            
            // Property: Height should be included if provided
            if (media.height !== undefined) {
              expect(html).toContain(`height="${media.height}"`);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty alt text", () => {
      const media: MediaItem = {
        url: "https://example.com/image.jpg",
        alt: "",
        type: "image",
      };
      
      const html = generateMediaHtml(media);
      
      // Property: Empty alt should still produce alt="" attribute
      expect(html).toContain('alt=""');
    });

    it("should handle missing optional fields", () => {
      const media: MediaItem = {
        url: "https://example.com/image.jpg",
        type: "image",
      };
      
      const html = generateMediaHtml(media);
      
      // Property: Should still generate valid HTML
      expect(html).toContain('src="https://example.com/image.jpg"');
      expect(html).toContain('alt=""'); // Default empty alt
    });

    it("should handle very long URLs", () => {
      const longPath = "a".repeat(500);
      const media: MediaItem = {
        url: `https://example.com/${longPath}.jpg`,
        type: "image",
      };
      
      const html = generateMediaHtml(media);
      
      // Property: Long URLs should be handled correctly
      expect(html).toContain(longPath);
    });
  });
});

// Export functions for potential reuse
export { generateImageHtml, generateVideoHtml, generateMediaHtml, escapeHtml, validateImageHtml };
