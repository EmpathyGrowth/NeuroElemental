"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface NavItem {
  id: string;
  label: string;
  url: string;
}

interface FooterContent {
  mainLinks: NavItem[];
  legalLinks: NavItem[];
}

// Fallback links if CMS is unavailable
const FALLBACK_LINKS: FooterContent = {
  mainLinks: [
    { id: "1", label: "Framework", url: "/framework" },
    { id: "2", label: "Elements", url: "/elements" },
    { id: "3", label: "Blog", url: "/blog" },
    { id: "4", label: "About", url: "/about" },
  ],
  legalLinks: [
    { id: "5", label: "Privacy Policy", url: "/privacy" },
    { id: "6", label: "Terms of Service", url: "/terms" },
  ],
};

export function DynamicFooter() {
  const [content, setContent] = useState<FooterContent>(FALLBACK_LINKS);
  const [year] = useState(() => new Date().getFullYear());

  useEffect(() => {
    // Fetch footer navigation from CMS
    fetch("/api/navigation?location=footer")
      .then((res) => res.json())
      .then((data) => {
        if (data.menu?.items && data.menu.items.length > 0) {
          // Separate main links from legal links (legal usually have specific paths)
          const legalPaths = ["/privacy", "/terms", "/cookies", "/legal"];
          const items = data.menu.items as NavItem[];

          setContent({
            mainLinks: items.filter(
              (item) => !legalPaths.some((p) => item.url.includes(p))
            ),
            legalLinks: items.filter((item) =>
              legalPaths.some((p) => item.url.includes(p))
            ),
          });
        }
      })
      .catch(() => {
        // Keep fallback on error
      });
  }, []);

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border/40">
      <div className="absolute inset-0 bg-muted/30" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY2N0VFQSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-10" />
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center space-y-8">
            {/* Main Navigation Links */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {content.mainLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.url}
                  className="text-muted-foreground hover:text-primary transition-all text-sm font-medium relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-[#764BA2] group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </div>

            {/* Legal & Copyright */}
            <div className="text-center space-y-4">
              <div className="flex flex-wrap justify-center gap-4">
                {content.legalLinks.map((link) => (
                  <Link
                    key={link.id}
                    href={link.url}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <p className="text-sm text-foreground font-medium">
                © {year} NeuroElemental™. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                The NeuroElemental System is a personal development framework,
                not a medical diagnostic tool or substitute for professional
                mental health treatment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
