"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { NotificationBell } from "@/components/global/notification-bell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth/supabase";
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  Settings,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const router = useRouter();
  const { user, profile, isAuthenticated, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) return null;

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2 ml-2">
        <Link href="/dashboard">
          <Button
            variant="ghost"
            size="sm"
            className="text-foreground/80 hover:text-foreground hover:bg-accent/50"
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </Link>
        <NotificationBell />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full hover:bg-accent/50"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(profile?.full_name || user?.email || null)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {profile?.full_name || user?.email || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                <p className="text-xs leading-none text-muted-foreground capitalize">
                  {profile?.role || "registered"} account
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
              <Link
                href="/dashboard/settings/privacy"
                className="cursor-pointer"
              >
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
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 ml-2">
      <Link href="/auth/login">
        <Button
          variant="ghost"
          size="sm"
          className="text-foreground/80 hover:text-foreground hover:bg-accent/50"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Login
        </Button>
      </Link>
      <Link href="/auth/signup">
        <Button
          size="sm"
          className="bg-gradient-to-r from-primary to-[#764BA2] hover:from-[#5568D3] hover:to-[#6A3F92] text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Sign Up
        </Button>
      </Link>
    </div>
  );
}
