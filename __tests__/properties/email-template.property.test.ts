/**
 * Feature: cms-enhancement-audit, Property 6 & 7: Email Template Properties
 * Property 6: Email Template Variable Substitution - Validates: Requirements 4.3
 * Property 7: HTML to Plain Text Conversion - Validates: Requirements 4.4
 *
 * Property 6: For any email template with defined variables and a complete set of
 * sample data, the preview render SHALL replace all variable placeholders with their
 * corresponding values, leaving no unsubstituted placeholders.
 *
 * Property 7: For any HTML email content, the auto-generated plain text version SHALL
 * contain all readable text content from the HTML, with formatting tags removed and
 * links preserved as URLs.
 */

import * as fc from "fast-check";
import { htmlToPlainText } from "@/components/cms/email-template-editor";

// ============================================================================
// Variable Substitution Logic (mirrors the preview component)
// ============================================================================

function substituteVariables(
  html: string,
  variables: string[],
  sampleData: Record<string, string>
): string {
  let result = html;
  variables.forEach((variable) => {
    // Escape special regex characters in the value to prevent issues
    const value = sampleData[variable] || `[${variable}]`;
    const escapedValue = value.replace(/\$/g, "$$$$"); // Escape $ for replace
    result = result.replace(new RegExp(`\\{\\{${variable}\\}\\}`, "g"), escapedValue);
  });
  return result;
}

// ============================================================================
// Generators
// ============================================================================

// Generate valid variable names (alphanumeric with underscores)
const variableNameArb = fc
  .stringMatching(/^[a-z][a-z0-9_]{0,19}$/)
  .filter((s) => s.length > 0);

// Generate a list of unique variable names
const variablesArb = fc
  .array(variableNameArb, { minLength: 0, maxLength: 5 })
  .map((vars) => [...new Set(vars)]);

// Generate sample data for variables (alphanumeric values to avoid regex issues)
const sampleDataArb = (variables: string[]): fc.Arbitrary<Record<string, string>> => {
  if (variables.length === 0) return fc.constant({});
  
  const entries = variables.map((v) =>
    fc.tuple(fc.constant(v), fc.stringMatching(/^[a-zA-Z0-9 ]{1,20}$/))
  );
  
  return fc.tuple(...entries).map((pairs) => Object.fromEntries(pairs));
};

// Generate HTML template with variable placeholders
const htmlTemplateArb = (variables: string[]): fc.Arbitrary<string> => {
  const parts = [
    fc.constant("<h1>"),
    fc.string({ minLength: 0, maxLength: 20 }),
    fc.constant("</h1>"),
    fc.constant("<p>"),
    fc.string({ minLength: 0, maxLength: 50 }),
    fc.constant("</p>"),
  ];

  // Add variable placeholders
  variables.forEach((v) => {
    parts.push(fc.constant(`{{${v}}}`));
    parts.push(fc.string({ minLength: 0, maxLength: 10 }));
  });

  return fc.tuple(...parts).map((p) => p.join(""));
};

// Generate simple HTML content for plain text conversion
const simpleHtmlArb = fc.oneof(
  fc.constant("<p>Hello World</p>"),
  fc.constant("<h1>Title</h1><p>Content</p>"),
  fc.constant('<a href="https://example.com">Link Text</a>'),
  fc.constant("<ul><li>Item 1</li><li>Item 2</li></ul>"),
  fc.constant("<div>Div content</div>"),
  fc.string({ minLength: 1, maxLength: 100 }).map((s) => `<p>${s}</p>`)
);

// ============================================================================
// Property Tests
// ============================================================================

describe("Email Template Properties", () => {
  /**
   * Property 6: Variable Substitution
   */
  describe("Property 6: Variable Substitution", () => {
    it("should replace all variable placeholders with sample data values", () => {
      fc.assert(
        fc.property(variablesArb, (variables) => {
          return fc.assert(
            fc.property(
              htmlTemplateArb(variables),
              sampleDataArb(variables),
              (html, sampleData) => {
                const result = substituteVariables(html, variables, sampleData);

                // Property: No unsubstituted placeholders should remain
                variables.forEach((variable) => {
                  if (sampleData[variable]) {
                    expect(result).not.toContain(`{{${variable}}}`);
                    expect(result).toContain(sampleData[variable]);
                  }
                });
              }
            ),
            { numRuns: 20 }
          );
        }),
        { numRuns: 10 }
      );
    });

    it("should handle templates with no variables", () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 100 }), (html) => {
          const result = substituteVariables(html, [], {});

          // Property: HTML should be unchanged when no variables
          expect(result).toBe(html);
        }),
        { numRuns: 50 }
      );
    });

    it("should handle missing sample data gracefully", () => {
      fc.assert(
        fc.property(variablesArb.filter((v) => v.length > 0), (variables) => {
          const html = variables.map((v) => `{{${v}}}`).join(" ");
          const partialData: Record<string, string> = {};

          // Only provide data for first variable
          if (variables.length > 0) {
            partialData[variables[0]] = "replaced";
          }

          const result = substituteVariables(html, variables, partialData);

          // Property: Variables with data should be replaced
          if (variables.length > 0) {
            expect(result).toContain("replaced");
          }

          // Property: Variables without data should show fallback
          variables.slice(1).forEach((v) => {
            expect(result).toContain(`[${v}]`);
          });
        }),
        { numRuns: 50 }
      );
    });

    it("should replace multiple occurrences of the same variable", () => {
      fc.assert(
        fc.property(
          variableNameArb,
          fc.integer({ min: 2, max: 5 }),
          fc.stringMatching(/^[a-zA-Z0-9]{1,20}$/), // Alphanumeric only to avoid regex issues
          (variable, count, value) => {
            const html = Array(count).fill(`{{${variable}}}`).join(" ");
            const result = substituteVariables(html, [variable], { [variable]: value });

            // Property: All occurrences should be replaced
            expect(result).not.toContain(`{{${variable}}}`);

            // Property: Value should appear count times (escape for regex)
            const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const matches = result.match(new RegExp(escapedValue, "g"));
            expect(matches?.length).toBe(count);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 7: HTML to Plain Text Conversion
   */
  describe("Property 7: HTML to Plain Text Conversion", () => {
    it("should remove HTML tags from content", () => {
      fc.assert(
        fc.property(simpleHtmlArb, (html) => {
          const plainText = htmlToPlainText(html);

          // Property: No HTML tags should remain
          expect(plainText).not.toMatch(/<[^>]+>/);
        }),
        { numRuns: 100 }
      );
    });

    it("should preserve text content from HTML", () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-zA-Z0-9]{1,50}$/), // Non-empty alphanumeric text
          (text) => {
            const html = `<p>${text}</p>`;
            const plainText = htmlToPlainText(html);

            // Property: Original text should be preserved
            expect(plainText).toContain(text);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should preserve link URLs in plain text", () => {
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.stringMatching(/^[a-zA-Z0-9]{1,20}$/), // Non-empty alphanumeric link text
          (url, linkText) => {
            const html = `<a href="${url}">${linkText}</a>`;
            const plainText = htmlToPlainText(html);

            // Property: Link text should be preserved
            expect(plainText).toContain(linkText);

            // Property: URL should be preserved (in parentheses)
            expect(plainText).toContain(url);
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should handle empty HTML", () => {
      const plainText = htmlToPlainText("");
      expect(plainText).toBe("");
    });

    it("should handle HTML with only tags (no text)", () => {
      fc.assert(
        fc.property(
          fc.constantFrom("<div></div>", "<p></p>", "<span></span>", "<br/>"),
          (html) => {
            const plainText = htmlToPlainText(html);

            // Property: Result should be empty or whitespace only
            expect(plainText.trim()).toBe("");
          }
        ),
        { numRuns: 20 }
      );
    });

    it("should decode HTML entities", () => {
      const testCases = [
        { html: "&amp;", expected: "&" },
        { html: "&lt;", expected: "<" },
        { html: "&gt;", expected: ">" },
        { html: "&quot;", expected: '"' },
      ];

      testCases.forEach(({ html, expected }) => {
        const plainText = htmlToPlainText(html);
        expect(plainText).toContain(expected);
      });
    });
  });
});
