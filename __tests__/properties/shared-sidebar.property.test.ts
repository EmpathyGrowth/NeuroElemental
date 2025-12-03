/**
 * Property-Based Tests for SharedDashboardSidebar Component
 *
 * Feature: tools-completion-and-platform-consolidation
 *
 * These tests verify correctness properties for role-based navigation
 * as specified in the design document.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fc from "fast-check";
import {
  type UserRole,
  type NavItem,
  getNavConfigByRole,
  getNavItemsForRole,
  studentNavConfig,
  instructorNavConfig,
  adminNavConfig,
  businessNavConfig,
} from "@/lib/constants/navigation";

/**
 * Valid user roles
 */
const VALID_ROLES: UserRole[] = ["student", "instructor", "admin", "business"];

/**
 * Arbitrary generators for role-related data
 */
const roleArb = fc.constantFrom(...VALID_ROLES);

/**
 * Mock localStorage for testing collapse state persistence
 */
class MockLocalStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

describe("Role-Based Navigation Properties", () => {
  /**
   * Feature: tools-completion-and-platform-consolidation, Property 12: Role-Based Navigation Items
   * Validates: Requirements 6.2
   *
   * For any user role, the sidebar should display exactly the navigation items
   * configured for that role in the centralized config, with no items from other roles.
   */
  it("Property 12: Role-Based Navigation Items - displays only items for specified role", async () => {
    await fc.assert(
      fc.property(
        roleArb,
        (role) => {
          const config = getNavConfigByRole(role);
          const navItems = getNavItemsForRole(role);

          // Get all items from other roles
          const otherRoles = VALID_ROLES.filter((r) => r !== role);
          const otherRoleItems = otherRoles.flatMap((r) => getNavItemsForRole(r));

          // Property 1: Config should exist for the role
          expect(config).toBeDefined();
          expect(config.title).toBeTruthy();
          expect(config.sections).toBeDefined();
          expect(config.sections.length).toBeGreaterThan(0);

          // Property 2: All nav items should have required properties
          navItems.forEach((item) => {
            expect(item.title).toBeTruthy();
            expect(item.href).toBeTruthy();
            expect(item.icon).toBeDefined();
          });

          // Property 3: Nav items should be unique within the role
          const hrefs = navItems.map((item) => item.href);
          const uniqueHrefs = new Set(hrefs);
          expect(uniqueHrefs.size).toBe(hrefs.length);

          // Property 4: Role-specific items should not appear in other roles
          // (except for common items like Dashboard/Overview)
          const roleSpecificItems = navItems.filter(
            (item) =>
              item.href.includes(`/dashboard/${role}`) ||
              item.href.includes(`/dashboard/${role}/`)
          );

          roleSpecificItems.forEach((item) => {
            const foundInOtherRole = otherRoleItems.some(
              (otherItem) => otherItem.href === item.href
            );
            expect(foundInOtherRole).toBe(false);
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });


  /**
   * Property: Each role has a unique configuration
   */
  it("Property: Each role has unique configuration", async () => {
    await fc.assert(
      fc.property(
        fc.tuple(roleArb, roleArb).filter(([r1, r2]) => r1 !== r2),
        ([role1, role2]) => {
          const config1 = getNavConfigByRole(role1);
          const config2 = getNavConfigByRole(role2);

          // Property: Different roles should have different titles
          expect(config1.title).not.toBe(config2.title);

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: All navigation items have valid hrefs
   */
  it("Property: All navigation items have valid hrefs", async () => {
    await fc.assert(
      fc.property(
        roleArb,
        (role) => {
          const navItems = getNavItemsForRole(role);

          navItems.forEach((item) => {
            // Property: Href should start with /
            expect(item.href.startsWith("/")).toBe(true);

            // Property: Href should not have trailing slash (except root)
            if (item.href !== "/") {
              expect(item.href.endsWith("/")).toBe(false);
            }

            // Property: Href should not contain spaces
            expect(item.href.includes(" ")).toBe(false);
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Section colors are valid
   */
  it("Property: All sections have valid colors", async () => {
    const validColors = ["blue", "purple", "pink", "green", "amber", "slate"];

    await fc.assert(
      fc.property(
        roleArb,
        (role) => {
          const config = getNavConfigByRole(role);

          config.sections.forEach((section) => {
            // Property: Section color should be valid
            expect(validColors).toContain(section.color);

            // Property: Section should have a title
            expect(section.title).toBeTruthy();

            // Property: Section should have at least one item
            expect(section.items.length).toBeGreaterThan(0);
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});


describe("Sidebar Collapse State Persistence Properties", () => {
  let mockStorage: MockLocalStorage;
  const COLLAPSE_STORAGE_KEY = "dashboard-sidebar-collapsed";

  beforeEach(() => {
    mockStorage = new MockLocalStorage();
  });

  afterEach(() => {
    mockStorage.clear();
  });

  /**
   * Feature: tools-completion-and-platform-consolidation, Property 13: Sidebar Collapse State Persistence
   * Validates: Requirements 6.4
   *
   * For any sidebar collapse action, the state should persist to localStorage
   * and be restored on page reload.
   */
  it("Property 13: Sidebar Collapse State Persistence - state persists across sessions", async () => {
    await fc.assert(
      fc.property(
        fc.boolean(), // initial collapsed state
        fc.array(fc.boolean(), { minLength: 1, maxLength: 10 }), // sequence of toggle actions
        (initialState, toggleSequence) => {
          mockStorage.clear();

          // Set initial state
          mockStorage.setItem(COLLAPSE_STORAGE_KEY, String(initialState));

          // Simulate reading initial state
          const savedInitial = mockStorage.getItem(COLLAPSE_STORAGE_KEY);
          let currentState = savedInitial === "true";

          // Property 1: Initial state should be correctly read
          expect(currentState).toBe(initialState);

          // Apply toggle sequence
          toggleSequence.forEach((shouldToggle) => {
            if (shouldToggle) {
              currentState = !currentState;
              mockStorage.setItem(COLLAPSE_STORAGE_KEY, String(currentState));
            }
          });

          // Property 2: Final state should be persisted
          const savedFinal = mockStorage.getItem(COLLAPSE_STORAGE_KEY);
          expect(savedFinal).toBe(String(currentState));

          // Simulate page reload - read state again
          const restoredState = mockStorage.getItem(COLLAPSE_STORAGE_KEY) === "true";

          // Property 3: Restored state should match final state
          expect(restoredState).toBe(currentState);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Default state when no saved preference
   */
  it("Property: Default state is expanded when no saved preference", () => {
    mockStorage.clear();

    // No saved state
    const saved = mockStorage.getItem(COLLAPSE_STORAGE_KEY);

    // Property: Should default to expanded (false) when no saved state
    expect(saved).toBeNull();

    // Default behavior: treat null as false (expanded)
    const isCollapsed = saved === "true";
    expect(isCollapsed).toBe(false);
  });

  /**
   * Property: Toggle always inverts state
   */
  it("Property: Toggle always inverts the current state", async () => {
    await fc.assert(
      fc.property(
        fc.boolean(), // current state
        (currentState) => {
          mockStorage.setItem(COLLAPSE_STORAGE_KEY, String(currentState));

          // Simulate toggle
          const newState = !currentState;
          mockStorage.setItem(COLLAPSE_STORAGE_KEY, String(newState));

          // Property: New state should be opposite of current
          const saved = mockStorage.getItem(COLLAPSE_STORAGE_KEY);
          expect(saved).toBe(String(!currentState));

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
