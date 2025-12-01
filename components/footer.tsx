import { Facebook } from 'lucide-react';

export function Footer() {
  const links = {
    main: [
      { label: 'Framework', href: '/framework' },
      { label: 'Elements', href: '/elements' },
      { label: 'Blog', href: '/blog' },
      { label: 'Science', href: '/science' },
      { label: 'About', href: '/about' },
      { label: 'Ethics', href: '/ethics' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  };

  // Social media links - add URLs when social accounts are created
  const socialLinks: { icon: typeof Facebook; href: string; label: string }[] = [
    // { icon: Facebook, href: 'https://facebook.com/neuroelemental', label: 'Facebook' },
    // { icon: Twitter, href: 'https://twitter.com/neuroelemental', label: 'Twitter' },
    // { icon: Instagram, href: 'https://instagram.com/neuroelemental', label: 'Instagram' },
    // { icon: Linkedin, href: 'https://linkedin.com/company/neuroelemental', label: 'LinkedIn' },
  ];

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border/40">
      <div className="absolute inset-0 bg-muted/30" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY2N0VFQSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-10" />
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center space-y-8">
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {links.main.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary transition-all text-sm font-medium relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-[#764BA2] group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </div>

            {socialLinks.length > 0 && (
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary transition-all hover:scale-110"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            )}

            <div className="text-center space-y-4">
              <div className="flex flex-wrap justify-center gap-4">
                {links.legal.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <p className="text-sm text-foreground font-medium">
                © 2025 NeuroElemental™. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                The NeuroElemental System is a personal development framework, not
                a medical diagnostic tool or substitute for professional mental
                health treatment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
