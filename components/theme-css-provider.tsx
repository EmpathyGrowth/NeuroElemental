"use client";

import { useEffect, useMemo, useState } from "react";

interface ThemeCssVariables {
  light: Record<string, string>;
  dark: Record<string, string>;
  typography: Record<string, string>;
  layout: Record<string, string>;
}

/**
 * Applies CSS variables from CMS theme settings
 * This component fetches theme CSS variables and injects them as a style tag
 */
export function ThemeCssProvider({ children }: { children: React.ReactNode }) {
  const [cssVariables, setCssVariables] = useState<ThemeCssVariables | null>(
    null
  );

  useEffect(() => {
    // AbortController for cleanup on unmount
    const controller = new AbortController();

    // Fetch theme CSS variables
    fetch("/api/theme?format=css", { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Theme fetch failed with status: ${res.status}`);
        }
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
           throw new Error(`Invalid content type: ${contentType}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.cssVariables) {
          setCssVariables(data.cssVariables);
        }
      })
      .catch((error) => {
        // Ignore abort errors
        if (error.name !== "AbortError") {
           console.warn("[ThemeCssProvider] Failed to load theme:", error);
           // Fallback to default/null is handled by state init
        }
      });

    return () => controller.abort();
  }, []);

  // Memoize CSS generation to avoid recalculating on every render
  const generatedCss = useMemo(() => {
    if (!cssVariables) return "";

    const { light, dark, typography, layout } = cssVariables;

    // Light mode variables
    const lightVars = Object.entries(light)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join("\n");

    // Dark mode variables
    const darkVars = Object.entries(dark)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join("\n");

    // Typography variables (apply to both modes)
    const typographyVars = Object.entries(typography)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join("\n");

    // Layout variables (apply to both modes)
    const layoutVars = Object.entries(layout)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join("\n");

    return `
      :root {
${lightVars}
${typographyVars}
${layoutVars}
      }

      .dark {
${darkVars}
      }
    `;
  }, [cssVariables]);

  return (
    <>
      {generatedCss && (
        <style
          id="cms-theme-variables"
          dangerouslySetInnerHTML={{ __html: generatedCss }}
        />
      )}
      {children}
    </>
  );
}
