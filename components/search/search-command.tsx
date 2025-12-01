"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useDebounce } from "@/hooks/use-debounce";
import {
  BarChart,
  Book,
  Calendar,
  FileText,
  GraduationCap,
  HelpCircle,
  Home,
  Loader2,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface SearchResult {
  id: string;
  type: "course" | "user" | "event" | "blog" | "quiz";
  title: string;
  description?: string;
  url: string;
  image?: string;
  meta?: Record<string, unknown>;
}

const typeIcons: Record<string, typeof Book> = {
  course: GraduationCap,
  user: Users,
  event: Calendar,
  blog: FileText,
  quiz: HelpCircle,
};

const typeLabels: Record<string, string> = {
  course: "Courses",
  user: "Users",
  event: "Events",
  blog: "Blog Posts",
  quiz: "Quizzes",
};

interface SearchCommandProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SearchCommand({
  open: controlledOpen,
  onOpenChange,
}: SearchCommandProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const debouncedQuery = useDebounce(query, 300);

  // Listen for keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  // Search API
  const search = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&limit=20`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      search(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery, search]);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    router.push(result.url);
  };

  // Group results by type
  const groupedResults = results.reduce<Record<string, SearchResult[]>>(
    (acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = [];
      }
      acc[result.type].push(result);
      return acc;
    },
    {}
  );

  // Quick navigation items
  const quickNav = [
    { label: "Home", icon: Home, url: "/" },
    { label: "Dashboard", icon: BarChart, url: "/dashboard" },
    { label: "Courses", icon: GraduationCap, url: "/courses" },
    { label: "Events", icon: Calendar, url: "/events" },
    { label: "Settings", icon: Settings, url: "/dashboard/settings" },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search courses, events, blog posts..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && query.length >= 2 && results.length === 0 && (
          <CommandEmpty>No results found for &quot;{query}&quot;</CommandEmpty>
        )}

        {!loading && query.length < 2 && (
          <>
            <CommandGroup heading="Quick Navigation">
              {quickNav.map((item) => (
                <CommandItem
                  key={item.url}
                  onSelect={() => {
                    setOpen(false);
                    router.push(item.url);
                  }}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Tips">
              <CommandItem disabled>
                <Search className="mr-2 h-4 w-4" />
                Type at least 2 characters to search
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {!loading &&
          Object.entries(groupedResults).map(([type, items]) => {
            const Icon = typeIcons[type] || FileText;
            return (
              <CommandGroup key={type} heading={typeLabels[type] || type}>
                {items.map((result) => (
                  <CommandItem
                    key={`${result.type}-${result.id}`}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-3"
                  >
                    {result.type === "user" && result.image ? (
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={result.image} />
                        <AvatarFallback>
                          {result.title?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.title}</p>
                      {result.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {result.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {type}
                    </Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
      </CommandList>
    </CommandDialog>
  );
}

/**
 * Search trigger button to open the command palette
 */
export function SearchTrigger({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground rounded-md border bg-background hover:bg-accent transition-colors ${className}`}
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <SearchCommand open={open} onOpenChange={setOpen} />
    </>
  );
}
