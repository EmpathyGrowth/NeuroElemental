'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Brain, LogIn, UserPlus, LayoutDashboard, User, Settings, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/components/auth/auth-provider';
import { signOut } from '@/lib/auth/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAuthenticated, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Framework', href: '/framework' },
    { label: 'Elements', href: '/elements' },
    { label: 'Brain Diversity', href: '/brain-diversity' },
    { label: 'Science', href: '/science' },
    { label: 'Courses', href: '/courses' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Certification', href: '/certification' },
    { label: 'Blog', href: '/blog' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/80 backdrop-blur-md shadow-lg border-b border-white/10'
          : 'bg-background/50 backdrop-blur-sm'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center space-x-2 group cursor-pointer flex-shrink-0">
            <div className="p-2 rounded-full bg-gradient-to-br from-primary/10 to-purple-200/20 group-hover:from-primary/20 group-hover:to-purple-200/30 transition-all">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg md:text-xl lg:text-2xl font-bold text-foreground">
              NeuroElemental™
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-4 xl:space-x-5">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-foreground/80 hover:text-primary transition-colors font-medium relative group text-sm xl:text-base ${
                  pathname === item.href ? 'text-primary font-semibold' : ''
                }`}
              >
                {item.label}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary to-[#764BA2] transition-all duration-300 ${
                  pathname === item.href ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </Link>
            ))}
            <ThemeToggle />

            {/* Always show auth buttons - loading state can cause issues */}
            {isAuthenticated ? (
              <>
                <Link href="/dashboard/admin">
                  <Button
                    variant="ghost"
                    className="text-foreground/80 hover:text-foreground hover:bg-accent/50"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-accent/50 hover:text-foreground">
                      <Avatar>
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback>
                          {getInitials(profile?.full_name || user?.email || null)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {profile?.full_name || user?.email || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground capitalize">
                          {profile?.role || 'registered'} account
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings/privacy" className="cursor-pointer">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Privacy & Data
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-destructive cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button
                    variant="ghost"
                    className="text-foreground/80 hover:text-foreground hover:bg-accent/50"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    className="bg-gradient-to-r from-primary to-[#764BA2] hover:from-[#5568D3] hover:to-[#6A3F92] text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up Free
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <ThemeToggle />
            <button
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 glass-card border-t border-border/10 mt-2 mx-4 rounded-xl">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all font-medium px-4 py-2 rounded-lg mx-2 ${
                    pathname === item.href ? 'text-primary font-semibold bg-primary/10' : ''
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="px-4 pt-2 space-y-2">
                <Link href="/assessment" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-primary to-[#764BA2] hover:from-[#5568D3] hover:to-[#6A3F92] text-white shadow-md">
                    Take Free Assessment
                  </Button>
                </Link>

                {!loading && (
                  <>
                    {isAuthenticated ? (
                      <>
                        <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full border-primary/50 text-foreground hover:text-foreground hover:bg-accent">
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            Dashboard
                          </Button>
                        </Link>
                        <Link href="/dashboard/profile" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full text-foreground hover:text-foreground hover:bg-accent">
                            <User className="w-4 h-4 mr-2" />
                            Profile
                          </Button>
                        </Link>
                        <Link href="/dashboard/settings" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full text-foreground hover:text-foreground hover:bg-accent">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </Button>
                        </Link>
                        <Link href="/dashboard/settings/privacy" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full text-foreground hover:text-foreground hover:bg-accent">
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            Privacy & Data
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          className="w-full text-destructive"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            handleSignOut();
                          }}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full text-foreground hover:text-foreground hover:bg-accent">
                            <LogIn className="w-4 h-4 mr-2" />
                            Login
                          </Button>
                        </Link>
                        <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button className="w-full bg-gradient-to-r from-primary to-[#764BA2] text-white">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Sign Up Free
                          </Button>
                        </Link>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
