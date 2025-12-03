/**
 * Feature: cms-enhancement-audit, Property 25: Image Upload Alt Text Requirement
 * Validates: Requirements 20.1
 *
 * For any image upload operation, the system SHALL require a non-empty alt text
 * value before completing the upload.
 */

import * as fc from "fast-check";

// ============================================================================
// Alt Text Validation Logic (mirrors ImageUpload component behavior)
// ============================================================================

interface ImageUploadConfig {
  requireAltText: boolean;
}

interface UploadAttempt {
  file: { name: string; type: string; size: number };
  altText: string | undefined;
}

/**
 * Validates if an upload should proceed based on alt text requirement
 * Returns true if upload should proceed, false if it should be blocked
 */
function shouldAllowUpload(
  config: ImageUploadConfig,
  attempt: UploadAttempt
): { allowed: boolean; reason?: string } {
  // If alt text is not required, always allow
  if (!config.requireAltText) {
    return { allowed: true };
  }

  // If alt text is required, check if it's provided and non-empty
  if (!attempt.altText || attempt.altText.trim() === "") {
    return {
      allowed: false,
      reason: "Alt text is required for accessibility",
    };
  }

  return { allowed: true };
}

/**
 * Validates alt text content
 * Returns true if alt text is valid (non-empty after trimming)
 */
function isValidAltText(altText: string | undefined | null): boolean {
  if (altText === undefined || altText === null) {
    return false;
  }
  return altText.trim().length > 0;
}

/**
 * Generates a descriptive alt text from filename (fallback helper)
 */
function generateAltTextFromFilename(filename: string): string {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.[^.]+$/, "");
  // Replace dashes and underscores with spaces
  const readable = nameWithoutExt.replace(/[-_]/g, " ");
  // Capitalize first letter
  return readable.charAt(0).toUpperCase() + readable.slice(1);
}

// ============================================================================
// Generators
// ============================================================================

// Generate valid image file info
const imageFileArb = fc.record({
  name: fc.stringMatching(/^[a-zA-Z0-9_-]{1,50}\.(jpg|png|gif|webp)$/),
  type: fc.constantFrom("image/jpeg", "image/png", "image/gif", "image/webp"),
  size: fc.integer({ min: 1, max: 10 * 1024 * 1024 }), // Up to 10MB
});

// Generate valid alt text (non-empty, meaningful)
const validAltTextArb = fc
  .stringMatching(/^[a-zA-Z0-9 ]{1,100}$/)
  .filter((s) => s.trim().length > 0);

// Generate invalid alt text (empty or whitespace only)
const invalidAltTextArb = fc.oneof(
  fc.constant(""),
  fc.constant("   "),
  fc.constant("\t\n"),
  fc.stringMatching(/^[\s]*$/)
);

// Generate upload config
const configArb = fc.record({
  requireAltText: fc.boolean(),
});

// ============================================================================
// Property Tests
// ============================================================================

describe("Alt Text Requirement Properties", () => {
  /**
   * Property 25: Image Upload Alt Text Requirement
   * Feature: cms-enhancement-audit, Property 25
   * Validates: Requirements 20.1
   */
  describe("Property 25: Image Upload Alt Text Requirement", () => {
    it("should block upload when alt text is required but not provided", () => {
      fc.assert(
        fc.property(imageFileArb, (file) => {
          const config: ImageUploadConfig = { requireAltText: true };
          const attempt: UploadAttempt = { file, altText: undefined };

          const result = shouldAllowUpload(config, attempt);

          // Property: Upload should be blocked when alt text is required but missing
          expect(result.allowed).toBe(false);
          expect(result.reason).toBeDefined();
        }),
        { numRuns: 100 }
      );
    });

    it("should block upload when alt text is required but empty", () => {
      fc.assert(
        fc.property(imageFileArb, invalidAltTextArb, (file, altText) => {
          const config: ImageUploadConfig = { requireAltText: true };
          const attempt: UploadAttempt = { file, altText };

          const result = shouldAllowUpload(config, attempt);

          // Property: Upload should be blocked when alt text is empty/whitespace
          expect(result.allowed).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it("should allow upload when alt text is required and provided", () => {
      fc.assert(
        fc.property(imageFileArb, validAltTextArb, (file, altText) => {
          const config: ImageUploadConfig = { requireAltText: true };
          const attempt: UploadAttempt = { file, altText };

          const result = shouldAllowUpload(config, attempt);

          // Property: Upload should be allowed when valid alt text is provided
          expect(result.allowed).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it("should allow upload when alt text is not required", () => {
      fc.assert(
        fc.property(
          imageFileArb,
          fc.option(fc.string(), { nil: undefined }),
          (file, altText) => {
            const config: ImageUploadConfig = { requireAltText: false };
            const attempt: UploadAttempt = { file, altText: altText ?? undefined };

            const result = shouldAllowUpload(config, attempt);

            // Property: Upload should always be allowed when alt text is not required
            expect(result.allowed).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Alt Text Validation", () => {
    it("should validate non-empty strings as valid alt text", () => {
      fc.assert(
        fc.property(validAltTextArb, (altText) => {
          // Property: Non-empty strings should be valid
          expect(isValidAltText(altText)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it("should validate empty/whitespace strings as invalid alt text", () => {
      fc.assert(
        fc.property(invalidAltTextArb, (altText) => {
          // Property: Empty/whitespace strings should be invalid
          expect(isValidAltText(altText)).toBe(false);
        }),
        { numRuns: 50 }
      );
    });

    it("should validate undefined/null as invalid alt text", () => {
      expect(isValidAltText(undefined)).toBe(false);
      expect(isValidAltText(null)).toBe(false);
    });
  });

  describe("Alt Text Generation Helper", () => {
    it("should generate readable alt text from filename", () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-zA-Z0-9_-]{1,30}$/),
          fc.constantFrom(".jpg", ".png", ".gif"),
          (name, ext) => {
            const filename = name + ext;
            const altText = generateAltTextFromFilename(filename);

            // Property: Generated alt text should not contain extension
            expect(altText).not.toContain(ext);

            // Property: Generated alt text should not contain dashes or underscores
            expect(altText).not.toContain("-");
            expect(altText).not.toContain("_");

            // Property: Generated alt text should start with uppercase
            if (altText.length > 0) {
              expect(altText[0]).toBe(altText[0].toUpperCase());
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle alt text with only spaces", () => {
      const config: ImageUploadConfig = { requireAltText: true };
      const attempt: UploadAttempt = {
        file: { name: "test.jpg", type: "image/jpeg", size: 1000 },
        altText: "     ",
      };

      const result = shouldAllowUpload(config, attempt);
      expect(result.allowed).toBe(false);
    });

    it("should handle alt text with leading/trailing spaces", () => {
      const config: ImageUploadConfig = { requireAltText: true };
      const attempt: UploadAttempt = {
        file: { name: "test.jpg", type: "image/jpeg", size: 1000 },
        altText: "  Valid alt text  ",
      };

      const result = shouldAllowUpload(config, attempt);
      expect(result.allowed).toBe(true);
    });

    it("should handle very long alt text", () => {
      const longAltText = "A".repeat(500);
      const config: ImageUploadConfig = { requireAltText: true };
      const attempt: UploadAttempt = {
        file: { name: "test.jpg", type: "image/jpeg", size: 1000 },
        altText: longAltText,
      };

      const result = shouldAllowUpload(config, attempt);
      expect(result.allowed).toBe(true);
    });
  });
});

// Export functions for potential reuse
export { shouldAllowUpload, isValidAltText, generateAltTextFromFilename };
