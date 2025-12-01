"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { signOut } from "@/lib/auth/supabase";
import { cn } from "@/lib/utils";
import {
  Bell,
  Brain,
  DollarSign,
  FileText,
  LayoutDashboard,
  LogIn,
  LogOut,
  Settings,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { learnItems, offeringsItems } from "./nav-data";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const prevPathname = useRef(pathname);

  // Close on route change (only when pathname actually changes)
  useEffect(() => {
    if (prevPathname.current !== pathname && isOpen) {
      onClose();
    }
    prevPathname.current = pathname;
  }, [pathname, isOpen, onClose]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:w-80 p-0">
        <SheetHeader className="p-4 border-b flex-row items-center space-y-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <SheetTitle className="text-left">Menu</SheetTitle>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-5rem)]">
          <div className="flex flex-col py-4">
            {/* Learn Section */}
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Learn
              </p>
              {learnItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all font-medium px-3 py-2 rounded-lg",
                    pathname === item.href &&
                      "text-primary font-semibold bg-primary/10"
                  )}
                  onClick={onClose}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
            </div>

            {/* Offerings Section */}
            <div className="px-4 py-2 border-t border-border/10">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Offerings
              </p>
              {offeringsItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all font-medium px-3 py-2 rounded-lg",
                    pathname === item.href &&
                      "text-primary font-semibold bg-primary/10"
                  )}
                  onClick={onClose}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
            </div>

            {/* Other Links */}
            <div className="px-4 py-2 border-t border-border/10">
              <Link
                href="/pricing"
                className={cn(
                  "flex items-center gap-2 text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all font-medium px-3 py-2 rounded-lg",
                  pathname === "/pricing" &&
                    "text-primary font-semibold bg-primary/10"
                )}
                onClick={onClose}
              >
                <DollarSign className="h-4 w-4 text-primary" />
                Pricing
              </Link>
              <Link
                href="/blog"
                className={cn(
                  "flex items-center gap-2 text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all font-medium px-3 py-2 rounded-lg",
                  pathname === "/blog" &&
                    "text-primary font-semibold bg-primary/10"
                )}
                onClick={onClose}
              >
                <FileText className="h-4 w-4 text-primary" />
                Blog
              </Link>
            </div>

            {/* CTA and Auth */}
            <div className="px-4 pt-2 space-y-2 border-t border-border/10">
              <Link href="/assessment" onClick={onClose}>
                <Button className="w-full bg-gradient-to-r from-primary to-[#764BA2] hover:from-[#5568D3] hover:to-[#6A3F92] text-white shadow-md">
                  Take Free Assessment
                </Button>
              </Link>

              {!loading && (
                <>
                  {isAuthenticated ? (
                    <>
                      <Link href="/dashboard" onClick={onClose}>
                        <Button
                          variant="outline"
                          className="w-full border-primary/50 text-foreground hover:text-foreground hover:bg-accent"
                        >
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                      <Link href="/dashboard/notifications" onClick={onClose}>
                        <Button
                          variant="outline"
                          className="w-full text-foreground hover:text-foreground hover:bg-accent"
                        >
                          <Bell className="w-4 h-4 mr-2" />
                          Notifications
                        </Button>
                      </Link>
                      <Link href="/dashboard/profile" onClick={onClose}>
                        <Button
                          variant="outline"
                          className="w-full text-foreground hover:text-foreground hover:bg-accent"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </Button>
                      </Link>
                      <Link href="/dashboard/settings" onClick={onClose}>
                        <Button
                          variant="outline"
                          className="w-full text-foreground hover:text-foreground hover:bg-accent"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Button>
                      </Link>
                      <Link
                        href="/dashboard/settings/privacy"
                        onClick={onClose}
                      >
                        <Button
                          variant="outline"
                          className="w-full text-foreground hover:text-foreground hover:bg-accent"
                        >
                          <ShieldCheck className="w-4 h-4 mr-2" />
                          Privacy & Data
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full text-destructive"
                        onClick={() => {
                          onClose();
                          handleSignOut();
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login" onClick={onClose}>
                        <Button
                          variant="outline"
                          className="w-full text-foreground hover:text-foreground hover:bg-accent"
                        >
                          <LogIn className="w-4 h-4 mr-2" />
                          Login
                        </Button>
                      </Link>
                      <Link href="/auth/signup" onClick={onClose}>
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
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
