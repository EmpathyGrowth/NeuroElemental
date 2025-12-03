/**
 * Playwright MCP Client Wrapper
 * 
 * Wraps Playwright MCP server functions for audit operations.
 * Provides page navigation, snapshot capture, and interaction testing.
 */

/**
 * Accessibility snapshot element
 */
export interface AccessibilityElement {
  role: string;
  name?: string;
  ref?: string;
  children?: AccessibilityElement[];
  disabled?: boolean;
  checked?: boolean;
  selected?: boolean;
  expanded?: boolean;
  level?: number;
  valuemin?: number;
  valuemax?: number;
  valuenow?: number;
  valuetext?: string;
}

/**
 * Console message from browser
 */
export interface ConsoleMessage {
  type: 'log' | 'warn' | 'error' | 'info' | 'debug';
  text: string;
  timestamp?: Date;
}

/**
 * Network request info
 */
export interface NetworkRequest {
  url: string;
  method: string;
  status?: number;
  duration?: number;
  resourceType: string;
}

/**
 * Page evaluation result
 */
export interface PageEvaluationResult {
  title: string;
  url: string;
  hasErrors: boolean;
  consoleErrors: ConsoleMessage[];
  accessibilityIssues: AccessibilityIssue[];
  loadTime?: number;
}

/**
 * Accessibility issue
 */
export interface AccessibilityIssue {
  type: string;
  element?: string;
  description: string;
  wcagCriteria?: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
}

/**
 * Navigation test result
 */
export interface NavigationTestResult {
  href: string;
  label: string;
  isWorking: boolean;
  finalUrl?: string;
  error?: string;
  statusCode?: number;
}

/**
 * Form field for testing
 */
export interface FormField {
  name: string;
  type: 'textbox' | 'checkbox' | 'radio' | 'combobox' | 'slider';
  ref: string;
  value: string;
}

/**
 * Playwright MCP Client
 * 
 * Note: This client provides utilities for working with Playwright MCP.
 * The actual MCP functions are called directly by the agent.
 */
export class PlaywrightMCPClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * Get full URL for a path
   */
  getFullUrl(path: string): string {
    if (path.startsWith('http')) {
      return path;
    }
    return `${this.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  }

  /**
   * Parse accessibility snapshot to find elements by role
   */
  static findElementsByRole(
    snapshot: AccessibilityElement,
    role: string
  ): AccessibilityElement[] {
    const results: AccessibilityElement[] = [];

    function traverse(element: AccessibilityElement) {
      if (element.role === role) {
        results.push(element);
      }
      if (element.children) {
        for (const child of element.children) {
          traverse(child);
        }
      }
    }

    traverse(snapshot);
    return results;
  }

  /**
   * Find all links in accessibility snapshot
   */
  static findLinks(snapshot: AccessibilityElement): AccessibilityElement[] {
    return this.findElementsByRole(snapshot, 'link');
  }

  /**
   * Find all buttons in accessibility snapshot
   */
  static findButtons(snapshot: AccessibilityElement): AccessibilityElement[] {
    return this.findElementsByRole(snapshot, 'button');
  }

  /**
   * Find all form inputs in accessibility snapshot
   */
  static findInputs(snapshot: AccessibilityElement): AccessibilityElement[] {
    const inputs: AccessibilityElement[] = [];
    const inputRoles = ['textbox', 'checkbox', 'radio', 'combobox', 'slider', 'spinbutton'];

    function traverse(element: AccessibilityElement) {
      if (inputRoles.includes(element.role)) {
        inputs.push(element);
      }
      if (element.children) {
        for (const child of element.children) {
          traverse(child);
        }
      }
    }

    traverse(snapshot);
    return inputs;
  }

  /**
   * Find navigation elements
   */
  static findNavigation(snapshot: AccessibilityElement): AccessibilityElement[] {
    return this.findElementsByRole(snapshot, 'navigation');
  }

  /**
   * Check for basic accessibility issues in snapshot
   */
  static checkAccessibility(snapshot: AccessibilityElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    function traverse(element: AccessibilityElement, path: string = '') {
      const elementPath = path ? `${path} > ${element.role}` : element.role;

      // Check for images without alt text
      if (element.role === 'img' && !element.name) {
        issues.push({
          type: 'missing-alt-text',
          element: elementPath,
          description: 'Image is missing alternative text',
          wcagCriteria: '1.1.1',
          severity: 'serious',
        });
      }

      // Check for buttons without accessible names
      if (element.role === 'button' && !element.name) {
        issues.push({
          type: 'missing-button-name',
          element: elementPath,
          description: 'Button is missing an accessible name',
          wcagCriteria: '4.1.2',
          severity: 'serious',
        });
      }

      // Check for links without accessible names
      if (element.role === 'link' && !element.name) {
        issues.push({
          type: 'missing-link-name',
          element: elementPath,
          description: 'Link is missing an accessible name',
          wcagCriteria: '2.4.4',
          severity: 'serious',
        });
      }

      // Check for form inputs without labels
      if (
        ['textbox', 'combobox', 'checkbox', 'radio'].includes(element.role) &&
        !element.name
      ) {
        issues.push({
          type: 'missing-form-label',
          element: elementPath,
          description: 'Form input is missing a label',
          wcagCriteria: '1.3.1',
          severity: 'serious',
        });
      }

      // Check heading hierarchy
      if (element.role === 'heading' && element.level) {
        // This is a simplified check - real check would track heading order
        if (element.level > 6 || element.level < 1) {
          issues.push({
            type: 'invalid-heading-level',
            element: elementPath,
            description: `Invalid heading level: ${element.level}`,
            wcagCriteria: '1.3.1',
            severity: 'moderate',
          });
        }
      }

      if (element.children) {
        for (const child of element.children) {
          traverse(child, elementPath);
        }
      }
    }

    traverse(snapshot);
    return issues;
  }

  /**
   * Parse console messages from MCP response
   */
  static parseConsoleMessages(response: unknown): ConsoleMessage[] {
    if (!Array.isArray(response)) {
      return [];
    }

    return response.map((msg: Record<string, unknown>) => ({
      type: (['log', 'warn', 'error', 'info', 'debug'].includes(String(msg.type))
        ? String(msg.type)
        : 'log') as ConsoleMessage['type'],
      text: String(msg.text || ''),
      timestamp: msg.timestamp ? new Date(String(msg.timestamp)) : undefined,
    }));
  }

  /**
   * Filter console messages to errors only
   */
  static getConsoleErrors(messages: ConsoleMessage[]): ConsoleMessage[] {
    return messages.filter((m) => m.type === 'error');
  }

  /**
   * Check if page has console errors
   */
  static hasConsoleErrors(messages: ConsoleMessage[]): boolean {
    return messages.some((m) => m.type === 'error');
  }

  /**
   * Extract navigation items from snapshot for testing
   */
  static extractNavigationItems(
    snapshot: AccessibilityElement
  ): { label: string; href: string; ref?: string }[] {
    const items: { label: string; href: string; ref?: string }[] = [];
    const links = this.findLinks(snapshot);

    for (const link of links) {
      if (link.name) {
        items.push({
          label: link.name,
          href: link.name, // In real usage, href would come from element attributes
          ref: link.ref,
        });
      }
    }

    return items;
  }

  /**
   * Check if element is interactive
   */
  static isInteractive(element: AccessibilityElement): boolean {
    const interactiveRoles = [
      'button',
      'link',
      'textbox',
      'checkbox',
      'radio',
      'combobox',
      'slider',
      'spinbutton',
      'menuitem',
      'tab',
    ];
    return interactiveRoles.includes(element.role);
  }

  /**
   * Count interactive elements in snapshot
   */
  static countInteractiveElements(snapshot: AccessibilityElement): number {
    let count = 0;

    function traverse(element: AccessibilityElement) {
      if (PlaywrightMCPClient.isInteractive(element)) {
        count++;
      }
      if (element.children) {
        for (const child of element.children) {
          traverse(child);
        }
      }
    }

    traverse(snapshot);
    return count;
  }
}

/**
 * Evaluate page for common issues
 */
export function evaluatePage(
  snapshot: AccessibilityElement,
  consoleMessages: ConsoleMessage[]
): PageEvaluationResult {
  const consoleErrors = PlaywrightMCPClient.getConsoleErrors(consoleMessages);
  const accessibilityIssues = PlaywrightMCPClient.checkAccessibility(snapshot);

  return {
    title: snapshot.name || 'Unknown',
    url: '',
    hasErrors: consoleErrors.length > 0 || accessibilityIssues.some((i) => i.severity === 'critical'),
    consoleErrors,
    accessibilityIssues,
  };
}

/**
 * Check if navigation item is working
 */
export function isNavigationWorking(result: NavigationTestResult): boolean {
  return result.isWorking && !result.error && (result.statusCode === undefined || result.statusCode < 400);
}
