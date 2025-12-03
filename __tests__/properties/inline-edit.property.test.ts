/**
 * Feature: cms-enhancement-audit, Property 18 & 19: Inline Edit Behavior
 * Property 18: Inline Edit Save on Confirm - Validates: Requirements 12.2
 * Property 19: Inline Edit Cancel on Escape - Validates: Requirements 12.3
 *
 * Property 18: For any inline edit operation where the user presses Enter or clicks
 * outside the field, the system SHALL save the new value via API and update the display.
 *
 * Property 19: For any inline edit operation where the user presses Escape, the system
 * SHALL discard changes and restore the original value without making an API call.
 */

import * as fc from "fast-check";

// Simulated inline edit state machine
interface InlineEditState {
  originalValue: string;
  currentValue: string;
  isEditing: boolean;
  savedValue: string | null;
  apiCallMade: boolean;
}

type InlineEditAction =
  | { type: "START_EDIT" }
  | { type: "CHANGE_VALUE"; value: string }
  | { type: "PRESS_ENTER" }
  | { type: "PRESS_ESCAPE" }
  | { type: "BLUR" };

function createInitialState(originalValue: string): InlineEditState {
  return {
    originalValue,
    currentValue: originalValue,
    isEditing: false,
    savedValue: null,
    apiCallMade: false,
  };
}

function reduceInlineEdit(
  state: InlineEditState,
  action: InlineEditAction
): InlineEditState {
  switch (action.type) {
    case "START_EDIT":
      return {
        ...state,
        isEditing: true,
        currentValue: state.originalValue,
        apiCallMade: false,
      };

    case "CHANGE_VALUE":
      if (!state.isEditing) return state;
      return {
        ...state,
        currentValue: action.value,
      };

    case "PRESS_ENTER":
    case "BLUR":
      if (!state.isEditing) return state;
      // Save if value changed
      if (state.currentValue !== state.originalValue) {
        return {
          ...state,
          isEditing: false,
          savedValue: state.currentValue,
          originalValue: state.currentValue, // Update original after save
          apiCallMade: true,
        };
      }
      // No change, just exit edit mode
      return {
        ...state,
        isEditing: false,
      };

    case "PRESS_ESCAPE":
      if (!state.isEditing) return state;
      // Cancel - restore original, no API call
      return {
        ...state,
        isEditing: false,
        currentValue: state.originalValue,
        apiCallMade: false,
      };

    default:
      return state;
  }
}

// Generators
const stringValueArb = fc.string({ minLength: 0, maxLength: 100 });

const actionArb: fc.Arbitrary<InlineEditAction> = fc.oneof(
  fc.constant({ type: "START_EDIT" } as InlineEditAction),
  fc.record({
    type: fc.constant("CHANGE_VALUE" as const),
    value: stringValueArb,
  }),
  fc.constant({ type: "PRESS_ENTER" } as InlineEditAction),
  fc.constant({ type: "PRESS_ESCAPE" } as InlineEditAction),
  fc.constant({ type: "BLUR" } as InlineEditAction)
);

describe("Inline Edit Behavior", () => {
  /**
   * Property 18: Save on Enter/Blur when value changed
   */
  describe("Property 18: Save on Confirm", () => {
    it("should save new value when Enter is pressed after change", () => {
      fc.assert(
        fc.property(stringValueArb, stringValueArb, (original, newValue) => {
          // Skip if values are the same
          fc.pre(original !== newValue);

          let state = createInitialState(original);
          state = reduceInlineEdit(state, { type: "START_EDIT" });
          state = reduceInlineEdit(state, {
            type: "CHANGE_VALUE",
            value: newValue,
          });
          state = reduceInlineEdit(state, { type: "PRESS_ENTER" });

          // Property: API call should be made
          expect(state.apiCallMade).toBe(true);
          // Property: Saved value should be the new value
          expect(state.savedValue).toBe(newValue);
          // Property: Should exit edit mode
          expect(state.isEditing).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it("should save new value when blur occurs after change", () => {
      fc.assert(
        fc.property(stringValueArb, stringValueArb, (original, newValue) => {
          fc.pre(original !== newValue);

          let state = createInitialState(original);
          state = reduceInlineEdit(state, { type: "START_EDIT" });
          state = reduceInlineEdit(state, {
            type: "CHANGE_VALUE",
            value: newValue,
          });
          state = reduceInlineEdit(state, { type: "BLUR" });

          expect(state.apiCallMade).toBe(true);
          expect(state.savedValue).toBe(newValue);
          expect(state.isEditing).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it("should not make API call when value unchanged", () => {
      fc.assert(
        fc.property(stringValueArb, (original) => {
          let state = createInitialState(original);
          state = reduceInlineEdit(state, { type: "START_EDIT" });
          // Don't change value
          state = reduceInlineEdit(state, { type: "PRESS_ENTER" });

          // Property: No API call when value unchanged
          expect(state.apiCallMade).toBe(false);
          expect(state.isEditing).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 19: Cancel on Escape
   */
  describe("Property 19: Cancel on Escape", () => {
    it("should restore original value when Escape is pressed", () => {
      fc.assert(
        fc.property(stringValueArb, stringValueArb, (original, newValue) => {
          fc.pre(original !== newValue);

          let state = createInitialState(original);
          state = reduceInlineEdit(state, { type: "START_EDIT" });
          state = reduceInlineEdit(state, {
            type: "CHANGE_VALUE",
            value: newValue,
          });
          state = reduceInlineEdit(state, { type: "PRESS_ESCAPE" });

          // Property: No API call on escape
          expect(state.apiCallMade).toBe(false);
          // Property: Current value should be restored to original
          expect(state.currentValue).toBe(original);
          // Property: Should exit edit mode
          expect(state.isEditing).toBe(false);
          // Property: No saved value
          expect(state.savedValue).toBeNull();
        }),
        { numRuns: 100 }
      );
    });

    it("should not affect original value when escape pressed without changes", () => {
      fc.assert(
        fc.property(stringValueArb, (original) => {
          let state = createInitialState(original);
          state = reduceInlineEdit(state, { type: "START_EDIT" });
          state = reduceInlineEdit(state, { type: "PRESS_ESCAPE" });

          expect(state.apiCallMade).toBe(false);
          expect(state.currentValue).toBe(original);
          expect(state.originalValue).toBe(original);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property: State machine consistency
   */
  describe("State Machine Consistency", () => {
    it("should maintain consistent state through any sequence of actions", () => {
      fc.assert(
        fc.property(
          stringValueArb,
          fc.array(actionArb, { minLength: 1, maxLength: 20 }),
          (original, actions) => {
            let state = createInitialState(original);

            for (const action of actions) {
              state = reduceInlineEdit(state, action);

              // Invariant: If not editing, current value should equal original
              if (!state.isEditing) {
                expect(state.currentValue).toBe(state.originalValue);
              }

              // Invariant: savedValue is set when a save has occurred at some point
              // Note: apiCallMade is reset on START_EDIT, but savedValue persists
              // This is correct behavior - we track the last saved value separately
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
