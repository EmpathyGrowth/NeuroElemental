/**
 * Property-Based Tests for Tool Recommendations
 *
 * Feature: tools-completion-and-platform-consolidation
 * Property 23: Element-Based Tool Recommendations
 * Validates: Requirements 14.2, 14.3, 14.4
 *
 * For any user with a primary element, the recommended tools should match
 * the element's energy type:
 * - Extroverted elements (Electric, Fiery): State Tracker, Energy Budget
 * - Introverted elements (Airy, Metallic): Shadow Work, Daily Check-In
 * - Ambiverted elements (Aquatic, Earthly): Regeneration Guide, Four States
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  getRecommendedToolsForElement,
  getEnergyTypeForElement,
  isValidElement,
  ELEMENT_ENERGY_TYPES,
  ENERGY_TYPE_TOOL_RECOMMENDATIONS,
  type Element,
  type EnergyType,
} from "@/lib/constants/tool-recommendations";

/**
 * Valid element types
 */
const VALID_ELEMENTS: Element[] = [
  "electric",
  "fiery",
  "aquatic",
  "earthly",
  "airy",
  "metallic",
];

/**
 * Expected tool mappings by energy type
 */
const EXPECTED_TOOLS: Record<EnergyType, string[]> = {
  extroverted: ["state-tracker", "energy-budget"],
  introverted: ["shadow-work", "daily-checkin"],
  ambiverted: ["regeneration", "four-states"],
};

/**
 * Expected energy types by element
 */
const EXPECTED_ENERGY_TYPES: Record<Element, EnergyType> = {
  electric: "extroverted",
  fiery: "extroverted",
  aquatic: "ambiverted",
  earthly: "ambiverted",
  airy: "introverted",
  metallic: "introverted",
};

/**
 * Arbitrary generators
 */
const elementArb = fc.constantFrom(...VALID_ELEMENTS);
const extrovertedElementArb = fc.constantFrom<Element>("electric", "fiery");
const introvertedElementArb = fc.constantFrom<Element>("airy", "metallic");
const ambivertedElementArb = fc.constantFrom<Element>("aquatic", "earthly");

describe("Element-Based Tool Recommendations Properties", () => {
  /**
   * Feature: tools-completion-and-platform-consolidation, Property 23: Element-Based Tool Recommendations
   * Validates: Requirements 14.2, 14.3, 14.4
   *
   * For any user with a primary element, the recommended tools should match
   * the element's energy type.
   */
  it("Property 23: Element-Based Tool Recommendations - returns correct tools for energy type", async () => {
    await fc.assert(
      fc.property(elementArb, (element) => {
        const recommendedTools = getRecommendedToolsForElement(element);
        const energyType = getEnergyTypeForElement(element);
        const expectedToolIds = EXPECTED_TOOLS[energyType];

        // Property: Recommended tools should match expected tools for energy type
        const recommendedToolIds = recommendedTools.map((t) => t.id);
        expect(recommendedToolIds).toEqual(expectedToolIds);

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Requirement 14.2: Extroverted elements (Electric, Fiery) get State Tracker, Energy Budget
   */
  it("Property: Extroverted elements get State Tracker and Energy Budget", async () => {
    await fc.assert(
      fc.property(extrovertedElementArb, (element) => {
        const recommendedTools = getRecommendedToolsForElement(element);
        const toolIds = recommendedTools.map((t) => t.id);

        // Property: Extroverted elements should get state-tracker and energy-budget
        expect(toolIds).toContain("state-tracker");
        expect(toolIds).toContain("energy-budget");
        expect(toolIds.length).toBe(2);

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Requirement 14.3: Introverted elements (Airy, Metallic) get Shadow Work, Daily Check-In
   */
  it("Property: Introverted elements get Shadow Work and Daily Check-In", async () => {
    await fc.assert(
      fc.property(introvertedElementArb, (element) => {
        const recommendedTools = getRecommendedToolsForElement(element);
        const toolIds = recommendedTools.map((t) => t.id);

        // Property: Introverted elements should get shadow-work and daily-checkin
        expect(toolIds).toContain("shadow-work");
        expect(toolIds).toContain("daily-checkin");
        expect(toolIds.length).toBe(2);

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Requirement 14.4: Ambiverted elements (Aquatic, Earthly) get Regeneration Guide, Four States
   */
  it("Property: Ambiverted elements get Regeneration Guide and Four States", async () => {
    await fc.assert(
      fc.property(ambivertedElementArb, (element) => {
        const recommendedTools = getRecommendedToolsForElement(element);
        const toolIds = recommendedTools.map((t) => t.id);

        // Property: Ambiverted elements should get regeneration and four-states
        expect(toolIds).toContain("regeneration");
        expect(toolIds).toContain("four-states");
        expect(toolIds.length).toBe(2);

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Energy type mapping is correct for all elements
   */
  it("Property: Energy type mapping is correct for all elements", async () => {
    await fc.assert(
      fc.property(elementArb, (element) => {
        const energyType = getEnergyTypeForElement(element);
        const expectedEnergyType = EXPECTED_ENERGY_TYPES[element];

        // Property: Energy type should match expected mapping
        expect(energyType).toBe(expectedEnergyType);

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: isValidElement correctly validates elements
   */
  it("Property: isValidElement correctly validates elements", async () => {
    // Test valid elements
    await fc.assert(
      fc.property(elementArb, (element) => {
        expect(isValidElement(element)).toBe(true);
        return true;
      }),
      { numRuns: 100 }
    );

    // Test invalid elements
    await fc.assert(
      fc.property(
        fc.string().filter((s) => !VALID_ELEMENTS.includes(s as Element)),
        (invalidElement) => {
          expect(isValidElement(invalidElement)).toBe(false);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Recommended tools always have required fields
   */
  it("Property: Recommended tools have all required fields", async () => {
    await fc.assert(
      fc.property(elementArb, (element) => {
        const recommendedTools = getRecommendedToolsForElement(element);

        // Property: Each tool should have all required fields
        recommendedTools.forEach((tool) => {
          expect(tool).toHaveProperty("id");
          expect(tool).toHaveProperty("title");
          expect(tool).toHaveProperty("description");
          expect(tool).toHaveProperty("href");
          expect(tool).toHaveProperty("icon");
          expect(tool).toHaveProperty("color");
          expect(tool).toHaveProperty("bgColor");

          // Fields should be non-empty strings
          expect(typeof tool.id).toBe("string");
          expect(tool.id.length).toBeGreaterThan(0);
          expect(typeof tool.title).toBe("string");
          expect(tool.title.length).toBeGreaterThan(0);
          expect(typeof tool.href).toBe("string");
          expect(tool.href.startsWith("/")).toBe(true);
        });

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Constants are consistent
   */
  it("Property: ELEMENT_ENERGY_TYPES and ENERGY_TYPE_TOOL_RECOMMENDATIONS are consistent", () => {
    // All elements should have an energy type
    VALID_ELEMENTS.forEach((element) => {
      expect(ELEMENT_ENERGY_TYPES[element]).toBeDefined();
    });

    // All energy types should have tool recommendations
    const energyTypes: EnergyType[] = ["extroverted", "introverted", "ambiverted"];
    energyTypes.forEach((energyType) => {
      expect(ENERGY_TYPE_TOOL_RECOMMENDATIONS[energyType]).toBeDefined();
      expect(ENERGY_TYPE_TOOL_RECOMMENDATIONS[energyType].length).toBeGreaterThan(0);
    });
  });

  /**
   * Property: Each element maps to exactly one energy type
   */
  it("Property: Each element maps to exactly one energy type", async () => {
    await fc.assert(
      fc.property(elementArb, (element) => {
        const energyType = ELEMENT_ENERGY_TYPES[element];

        // Property: Energy type should be one of the valid types
        expect(["extroverted", "introverted", "ambiverted"]).toContain(energyType);

        return true;
      }),
      { numRuns: 100 }
    );
  });
});
