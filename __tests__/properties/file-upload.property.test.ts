/**
 * Property-Based Tests for BaseFileUpload Component
 *
 * Feature: tools-completion-and-platform-consolidation
 *
 * These tests verify correctness properties for file upload validation
 * as specified in the design document.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { validateFile } from "@/components/forms/base-file-upload";

/**
 * Common file types for testing
 */
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALL_VALID_TYPES = [...IMAGE_TYPES, ...DOCUMENT_TYPES];

/**
 * Arbitrary generators for file-related data
 */
const fileSizeArb = fc.integer({ min: 1, max: 100 * 1024 * 1024 }); // 1 byte to 100MB
const maxSizeMBArb = fc.integer({ min: 1, max: 50 }); // 1MB to 50MB
const fileTypeArb = fc.constantFrom(...ALL_VALID_TYPES);
const invalidFileTypeArb = fc.constantFrom(
  "application/octet-stream",
  "text/plain",
  "video/mp4",
  "audio/mpeg",
  "application/zip"
);

/**
 * Create a mock File object for testing
 */
function createMockFile(size: number, type: string, name: string = "test-file"): File {
  // Create a blob with the specified size
  const content = new Uint8Array(size);
  const blob = new Blob([content], { type });
  
  // Create a File from the blob
  return new File([blob], name, { type });
}

describe("File Upload Size Validation Properties", () => {
  /**
   * Feature: tools-completion-and-platform-consolidation, Property 14: File Upload Size Validation
   * Validates: Requirements 7.2, 7.3
   *
   * For any file upload attempt, files exceeding the configured maxSizeMB
   * should be rejected with an error before upload begins.
   */
  it("Property 14: File Upload Size Validation - rejects files exceeding max size", async () => {
    await fc.assert(
      fc.property(
        maxSizeMBArb, // max size in MB
        fc.integer({ min: 1, max: 50 }), // additional MB over limit
        fileTypeArb, // valid file type
        (maxSizeMB, additionalMB, fileType) => {
          // Create a file that exceeds the limit
          const fileSizeBytes = (maxSizeMB + additionalMB) * 1024 * 1024;
          const file = createMockFile(fileSizeBytes, fileType);

          // Validate the file
          const error = validateFile(file, maxSizeMB, [fileType]);

          // Property: Files exceeding max size should be rejected
          expect(error).not.toBeNull();
          expect(error).toContain("too large");
          expect(error).toContain(`${maxSizeMB}MB`);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });


  /**
   * Property: Files within size limit are accepted
   */
  it("Property: Files within size limit are accepted", async () => {
    await fc.assert(
      fc.property(
        maxSizeMBArb, // max size in MB
        fc.double({ min: 0.01, max: 0.99 }), // fraction of max size
        fileTypeArb, // valid file type
        (maxSizeMB, fraction, fileType) => {
          // Create a file within the limit
          const fileSizeBytes = Math.floor(maxSizeMB * fraction * 1024 * 1024);
          const file = createMockFile(Math.max(1, fileSizeBytes), fileType);

          // Validate the file
          const error = validateFile(file, maxSizeMB, [fileType]);

          // Property: Files within limit should be accepted (no error)
          expect(error).toBeNull();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Files exactly at the limit are accepted
   */
  it("Property: Files exactly at size limit are accepted", async () => {
    await fc.assert(
      fc.property(
        maxSizeMBArb, // max size in MB
        fileTypeArb, // valid file type
        (maxSizeMB, fileType) => {
          // Create a file exactly at the limit
          const fileSizeBytes = maxSizeMB * 1024 * 1024;
          const file = createMockFile(fileSizeBytes, fileType);

          // Validate the file
          const error = validateFile(file, maxSizeMB, [fileType]);

          // Property: Files exactly at limit should be accepted
          expect(error).toBeNull();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Avatar uploads enforce 2MB limit
   */
  it("Property: Avatar uploads enforce 2MB limit", async () => {
    const AVATAR_MAX_SIZE_MB = 2;

    await fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }), // additional MB over limit
        fc.constantFrom(...IMAGE_TYPES), // avatar accepts images only
        (additionalMB, fileType) => {
          // Create a file that exceeds avatar limit
          const fileSizeBytes = (AVATAR_MAX_SIZE_MB + additionalMB) * 1024 * 1024;
          const file = createMockFile(fileSizeBytes, fileType);

          // Validate with avatar settings
          const error = validateFile(file, AVATAR_MAX_SIZE_MB, IMAGE_TYPES);

          // Property: Files exceeding avatar limit should be rejected
          expect(error).not.toBeNull();
          expect(error).toContain("too large");

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: General image uploads enforce 10MB limit
   */
  it("Property: General image uploads enforce 10MB limit", async () => {
    const IMAGE_MAX_SIZE_MB = 10;

    await fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }), // additional MB over limit
        fc.constantFrom(...IMAGE_TYPES),
        (additionalMB, fileType) => {
          // Create a file that exceeds image limit
          const fileSizeBytes = (IMAGE_MAX_SIZE_MB + additionalMB) * 1024 * 1024;
          const file = createMockFile(fileSizeBytes, fileType);

          // Validate with image settings
          const error = validateFile(file, IMAGE_MAX_SIZE_MB, IMAGE_TYPES);

          // Property: Files exceeding image limit should be rejected
          expect(error).not.toBeNull();
          expect(error).toContain("too large");

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});


describe("File Type Validation Properties", () => {
  /**
   * Property: Invalid file types are rejected
   */
  it("Property: Invalid file types are rejected", async () => {
    await fc.assert(
      fc.property(
        invalidFileTypeArb, // invalid file type
        maxSizeMBArb, // any max size
        (invalidType, maxSizeMB) => {
          // Create a small file with invalid type
          const file = createMockFile(1024, invalidType); // 1KB

          // Validate with image types only
          const error = validateFile(file, maxSizeMB, IMAGE_TYPES);

          // Property: Invalid types should be rejected
          expect(error).not.toBeNull();
          expect(error).toContain("Invalid file type");

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Valid file types are accepted
   */
  it("Property: Valid file types are accepted", async () => {
    await fc.assert(
      fc.property(
        fileTypeArb, // valid file type
        maxSizeMBArb, // any max size
        (validType, maxSizeMB) => {
          // Create a small file with valid type
          const file = createMockFile(1024, validType); // 1KB

          // Validate with all valid types
          const error = validateFile(file, maxSizeMB, ALL_VALID_TYPES);

          // Property: Valid types should be accepted
          expect(error).toBeNull();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Avatar uploads only accept image types
   */
  it("Property: Avatar uploads only accept image types", async () => {
    const AVATAR_MAX_SIZE_MB = 2;

    await fc.assert(
      fc.property(
        fc.constantFrom(...DOCUMENT_TYPES), // document types (not images)
        (documentType) => {
          // Create a small file with document type
          const file = createMockFile(1024, documentType); // 1KB

          // Validate with avatar settings (images only)
          const error = validateFile(file, AVATAR_MAX_SIZE_MB, IMAGE_TYPES);

          // Property: Document types should be rejected for avatars
          expect(error).not.toBeNull();
          expect(error).toContain("Invalid file type");

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe("Combined Validation Properties", () => {
  /**
   * Property: Both size and type must be valid for acceptance
   */
  it("Property: Both size and type must be valid for acceptance", async () => {
    await fc.assert(
      fc.property(
        fc.boolean(), // is size valid
        fc.boolean(), // is type valid
        maxSizeMBArb,
        (isSizeValid, isTypeValid, maxSizeMB) => {
          // Determine file size
          const fileSizeBytes = isSizeValid
            ? Math.floor(maxSizeMB * 0.5 * 1024 * 1024) // 50% of limit
            : (maxSizeMB + 5) * 1024 * 1024; // 5MB over limit

          // Determine file type
          const fileType = isTypeValid ? "image/jpeg" : "application/octet-stream";

          const file = createMockFile(Math.max(1, fileSizeBytes), fileType);
          const error = validateFile(file, maxSizeMB, IMAGE_TYPES);

          if (isSizeValid && isTypeValid) {
            // Property: Both valid = accepted
            expect(error).toBeNull();
          } else {
            // Property: Either invalid = rejected
            expect(error).not.toBeNull();
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Error messages are descriptive
   */
  it("Property: Error messages are descriptive", async () => {
    await fc.assert(
      fc.property(
        fc.boolean(), // test size error vs type error
        maxSizeMBArb,
        (testSizeError, maxSizeMB) => {
          let file: File;
          let error: string | null;

          if (testSizeError) {
            // Create oversized file with valid type
            file = createMockFile((maxSizeMB + 5) * 1024 * 1024, "image/jpeg");
            error = validateFile(file, maxSizeMB, IMAGE_TYPES);

            // Property: Size error should mention size limit
            expect(error).not.toBeNull();
            expect(error).toContain("MB");
          } else {
            // Create small file with invalid type
            file = createMockFile(1024, "application/octet-stream");
            error = validateFile(file, maxSizeMB, IMAGE_TYPES);

            // Property: Type error should mention accepted types
            expect(error).not.toBeNull();
            expect(error).toContain("Invalid file type");
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
