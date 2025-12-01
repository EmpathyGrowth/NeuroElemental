'use client';

import * as React from 'react';
import { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronRight,
  ChevronDown,
  Home,
  MoreHorizontal,
  Folder,
  File,
  Star,
  Clock,
  Search,
  Copy,
  ExternalLink,
  Edit2,
  Pin,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface BreadcrumbItem {
  id?: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  isCurrentPage?: boolean;
  onClick?: () => void;
  children?: BreadcrumbItem[];
  metadata?: Record<string, unknown>;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
  showHome?: boolean;
  homeHref?: string;
  onNavigate?: (item: BreadcrumbItem) => void;
  className?: string;
}

export interface SmartBreadcrumbsProps extends BreadcrumbsProps {
  recentItems?: BreadcrumbItem[];
  pinnedItems?: BreadcrumbItem[];
  onPin?: (item: BreadcrumbItem) => void;
  onUnpin?: (item: BreadcrumbItem) => void;
  searchable?: boolean;
  onSearch?: (query: string) => Promise<BreadcrumbItem[]>;
}

export interface BreadcrumbDropdownProps {
  items: BreadcrumbItem[];
  onSelect: (item: BreadcrumbItem) => void;
  trigger?: React.ReactNode;
}

// ============================================================================
// Separator Component
// ============================================================================

export interface BreadcrumbSeparatorProps {
  children?: React.ReactNode;
  className?: string;
}

export function BreadcrumbSeparator({
  children,
  className,
}: BreadcrumbSeparatorProps) {
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={cn('mx-2 text-muted-foreground', className)}
    >
      {children || <ChevronRight className="h-4 w-4" />}
    </span>
  );
}

// ============================================================================
// Breadcrumb Link Component
// ============================================================================

interface BreadcrumbLinkProps {
  item: BreadcrumbItem;
  onNavigate?: (item: BreadcrumbItem) => void;
  className?: string;
}

function BreadcrumbLink({ item, onNavigate, className }: BreadcrumbLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (item.onClick) {
      e.preventDefault();
      item.onClick();
    } else if (onNavigate) {
      e.preventDefault();
      onNavigate(item);
    }
  };

  const baseClassName = cn(
    'inline-flex items-center gap-1.5 text-sm transition-colors',
    item.isCurrentPage
      ? 'font-medium text-foreground'
      : 'text-muted-foreground hover:text-foreground',
    className
  );

  const content = (
    <>
      {item.icon}
      <span className={item.isCurrentPage ? undefined : 'truncate max-w-[150px]'}>
        {item.label}
      </span>
    </>
  );

  if (item.isCurrentPage) {
    return (
      <span className={baseClassName} aria-current="page">
        {content}
      </span>
    );
  }

  if (item.href) {
    return (
      <Link href={item.href} className={baseClassName} onClick={handleClick}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={baseClassName} onClick={handleClick}>
      {content}
    </button>
  );
}

// ============================================================================
// Breadcrumb Dropdown Component
// ============================================================================

export function BreadcrumbDropdown({
  items,
  onSelect,
  trigger,
}: BreadcrumbDropdownProps) {
  if (items.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-1 py-0.5 text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {items.map((item, index) => (
          <DropdownMenuItem
            key={item.id || index}
            onClick={() => onSelect(item)}
            className="gap-2"
          >
            {item.icon || <Folder className="h-4 w-4" />}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================================================
// Breadcrumb Item with Children Dropdown
// ============================================================================

interface BreadcrumbItemWithChildrenProps {
  item: BreadcrumbItem;
  onNavigate?: (item: BreadcrumbItem) => void;
}

function BreadcrumbItemWithChildren({
  item,
  onNavigate,
}: BreadcrumbItemWithChildrenProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!item.children || item.children.length === 0) {
    return <BreadcrumbLink item={item} onNavigate={onNavigate} />;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1 text-sm transition-colors',
            item.isCurrentPage
              ? 'font-medium text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {item.icon}
          <span className="truncate max-w-[150px]">{item.label}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {item.children.map((child, index) => (
          <DropdownMenuItem
            key={child.id || index}
            onClick={() => {
              onNavigate?.(child);
              setIsOpen(false);
            }}
            className="gap-2"
          >
            {child.icon || <Folder className="h-4 w-4" />}
            {child.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================================================
// Basic Breadcrumbs Component
// ============================================================================

/**
 * Breadcrumbs component for navigation hierarchy display
 * @param items - Array of breadcrumb items with label and optional href
 * @param separator - Custom separator element between items
 * @param maxItems - Maximum items to show before collapsing (default: 4)
 * @param showHome - Whether to show a home icon link at the start (default: true)
 * @param homeHref - URL for home icon (default: '/dashboard')
 * @param onNavigate - Callback when a breadcrumb is clicked
 * @param className - Additional CSS classes
 */
export function Breadcrumbs({
  items,
  separator,
  maxItems = 4,
  showHome = true,
  homeHref = '/dashboard',
  onNavigate,
  className,
}: BreadcrumbsProps) {
  const { visibleItems, collapsedItems } = useMemo(() => {
    if (items.length <= maxItems) {
      return { visibleItems: items, collapsedItems: [] };
    }

    // Always show first and last items, collapse middle
    const first = items.slice(0, 1);
    const last = items.slice(-(maxItems - 2));
    const collapsed = items.slice(1, -(maxItems - 2));

    return {
      visibleItems: [...first, ...last],
      collapsedItems: collapsed,
    };
  }, [items, maxItems]);

  const handleSelect = useCallback(
    (item: BreadcrumbItem) => {
      if (item.onClick) {
        item.onClick();
      } else if (onNavigate) {
        onNavigate(item);
      }
    },
    [onNavigate]
  );

  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-sm', className)}>
      <ol className="flex items-center">
        {/* Home Icon */}
        {showHome && (
          <li className="flex items-center">
            <Link
              href={homeHref}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Home"
            >
              <Home className="h-4 w-4" />
            </Link>
            <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>
          </li>
        )}

        {/* First Item */}
        {visibleItems.length > 0 && (
          <li className="flex items-center">
            <BreadcrumbItemWithChildren
              item={visibleItems[0]}
              onNavigate={onNavigate}
            />
          </li>
        )}

        {/* Collapsed Items Dropdown */}
        {collapsedItems.length > 0 && (
          <li className="flex items-center">
            <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>
            <BreadcrumbDropdown items={collapsedItems} onSelect={handleSelect} />
          </li>
        )}

        {/* Remaining Visible Items */}
        {visibleItems.slice(1).map((item, index) => (
          <li key={item.id || index} className="flex items-center">
            <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>
            <BreadcrumbItemWithChildren item={item} onNavigate={onNavigate} />
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ============================================================================
// Smart Breadcrumbs Component (with search, recent, pinned)
// ============================================================================

export function SmartBreadcrumbs({
  items,
  separator,
  maxItems = 4,
  showHome = true,
  homeHref = '/dashboard',
  onNavigate,
  recentItems = [],
  pinnedItems = [],
  onPin,
  onUnpin,
  searchable = false,
  onSearch,
  className,
}: SmartBreadcrumbsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BreadcrumbItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const currentItem = items[items.length - 1];
  const isPinned = pinnedItems.some((p) => p.id === currentItem?.id);

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (!query.trim() || !onSearch) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await onSearch(query);
        setSearchResults(results);
      } finally {
        setIsSearching(false);
      }
    },
    [onSearch]
  );

  const handleCopyPath = useCallback(() => {
    const path = items.map((i) => i.label).join(' / ');
    navigator.clipboard.writeText(path);
  }, [items]);

  const handleCopyUrl = useCallback(() => {
    if (currentItem?.href) {
      navigator.clipboard.writeText(window.location.origin + currentItem.href);
    }
  }, [currentItem]);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Breadcrumbs
        items={items}
        separator={separator}
        maxItems={maxItems}
        showHome={showHome}
        homeHref={homeHref}
        onNavigate={onNavigate}
        className="flex-1 min-w-0"
      />

      {/* Quick Actions */}
      <div className="flex items-center gap-1">
        {/* Search */}
        {searchable && onSearch && (
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Search className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-2 border-b">
                <Input
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search navigation..."
                  className="h-8"
                  autoFocus
                />
              </div>
              <ScrollArea className="h-60">
                <div className="p-1">
                  {/* Search Results */}
                  {searchQuery && (
                    <div className="mb-2">
                      <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                        Search Results
                      </div>
                      {isSearching ? (
                        <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                          Searching...
                        </div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((item, index) => (
                          <button
                            key={item.id || index}
                            type="button"
                            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                            onClick={() => {
                              onNavigate?.(item);
                              setIsPopoverOpen(false);
                            }}
                          >
                            {item.icon || <File className="h-4 w-4" />}
                            {item.label}
                          </button>
                        ))
                      ) : (
                        <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                          No results found
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pinned Items */}
                  {!searchQuery && pinnedItems.length > 0 && (
                    <div className="mb-2">
                      <div className="px-2 py-1 text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Pin className="h-3 w-3" />
                        Pinned
                      </div>
                      {pinnedItems.map((item, index) => (
                        <button
                          key={item.id || index}
                          type="button"
                          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                          onClick={() => {
                            onNavigate?.(item);
                            setIsPopoverOpen(false);
                          }}
                        >
                          <Star className="h-4 w-4 text-amber-500" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Recent Items */}
                  {!searchQuery && recentItems.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Recent
                      </div>
                      {recentItems.map((item, index) => (
                        <button
                          key={item.id || index}
                          type="button"
                          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                          onClick={() => {
                            onNavigate?.(item);
                            setIsPopoverOpen(false);
                          }}
                        >
                          {item.icon || <File className="h-4 w-4" />}
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        )}

        {/* More Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCopyPath}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Path
            </DropdownMenuItem>
            {currentItem?.href && (
              <DropdownMenuItem onClick={handleCopyUrl}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Copy URL
              </DropdownMenuItem>
            )}
            {onPin && onUnpin && currentItem && (
              <DropdownMenuItem
                onClick={() =>
                  isPinned ? onUnpin(currentItem) : onPin(currentItem)
                }
              >
                {isPinned ? (
                  <>
                    <Star className="mr-2 h-4 w-4" />
                    Unpin
                  </>
                ) : (
                  <>
                    <Star className="mr-2 h-4 w-4" />
                    Pin to Quick Access
                  </>
                )}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ============================================================================
// Editable Breadcrumbs Component
// ============================================================================

export interface EditableBreadcrumbsProps extends BreadcrumbsProps {
  onRename?: (item: BreadcrumbItem, newLabel: string) => void;
  allowEdit?: boolean;
}

export function EditableBreadcrumbs({
  items,
  separator,
  maxItems: _maxItems = 4,
  showHome = true,
  homeHref = '/dashboard',
  onNavigate,
  onRename,
  allowEdit = true,
  className,
}: EditableBreadcrumbsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleStartEdit = (item: BreadcrumbItem) => {
    if (item.id) {
      setEditingId(item.id);
      setEditValue(item.label);
    }
  };

  const handleSaveEdit = (item: BreadcrumbItem) => {
    if (editValue.trim() && editValue !== item.label) {
      onRename?.(item, editValue.trim());
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, item: BreadcrumbItem) => {
    if (e.key === 'Enter') {
      handleSaveEdit(item);
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditValue('');
    }
  };

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-sm', className)}>
      <ol className="flex items-center">
        {showHome && (
          <li className="flex items-center">
            <Link
              href={homeHref}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Home"
            >
              <Home className="h-4 w-4" />
            </Link>
            <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>
          </li>
        )}

        {items.map((item, index) => (
          <li key={item.id || index} className="flex items-center">
            {index > 0 && <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>}

            {editingId === item.id ? (
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => handleSaveEdit(item)}
                onKeyDown={(e) => handleKeyDown(e, item)}
                className="h-6 w-32 text-sm"
                autoFocus
              />
            ) : (
              <div className="group flex items-center gap-1">
                <BreadcrumbLink item={item} onNavigate={onNavigate} />
                {allowEdit && onRename && !item.isCurrentPage && item.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100"
                    onClick={() => handleStartEdit(item)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ============================================================================
// Page Breadcrumbs Component (with title and actions)
// ============================================================================

export interface PageBreadcrumbsProps {
  items: BreadcrumbItem[];
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onNavigate?: (item: BreadcrumbItem) => void;
  className?: string;
}

export function PageBreadcrumbs({
  items,
  title,
  subtitle,
  actions,
  onNavigate,
  className,
}: PageBreadcrumbsProps) {
  const currentItem = items[items.length - 1];
  const displayTitle = title || currentItem?.label;

  return (
    <div className={cn('space-y-1', className)}>
      <Breadcrumbs
        items={items.slice(0, -1)}
        onNavigate={onNavigate}
        showHome
      />
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          {displayTitle && (
            <h1 className="truncate text-2xl font-bold tracking-tight">
              {displayTitle}
            </h1>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

// ============================================================================
// Responsive Breadcrumbs Component
// ============================================================================

export interface ResponsiveBreadcrumbsProps extends BreadcrumbsProps {
  mobileMaxItems?: number;
}

export function ResponsiveBreadcrumbs({
  items,
  separator,
  maxItems = 5,
  mobileMaxItems = 2,
  showHome = true,
  homeHref = '/dashboard',
  onNavigate,
  className,
}: ResponsiveBreadcrumbsProps) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <Breadcrumbs
          items={items}
          separator={separator}
          maxItems={maxItems}
          showHome={showHome}
          homeHref={homeHref}
          onNavigate={onNavigate}
          className={className}
        />
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <Breadcrumbs
          items={items}
          separator={separator}
          maxItems={mobileMaxItems}
          showHome={showHome}
          homeHref={homeHref}
          onNavigate={onNavigate}
          className={className}
        />
      </div>
    </>
  );
}

// ============================================================================
// Path Display Component (non-navigable)
// ============================================================================

export interface PathDisplayProps {
  path: string[];
  separator?: string;
  copyable?: boolean;
  className?: string;
}

export function PathDisplay({
  path,
  separator = '/',
  copyable = true,
  className,
}: PathDisplayProps) {
  const pathString = path.join(` ${separator} `);

  const handleCopy = () => {
    navigator.clipboard.writeText(path.join(separator));
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm font-mono',
        className
      )}
    >
      <span className="truncate">{pathString}</span>
      {copyable && (
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 shrink-0"
          onClick={handleCopy}
        >
          <Copy className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// Breadcrumb Context Hook
// ============================================================================

interface BreadcrumbContextValue {
  items: BreadcrumbItem[];
  setItems: (items: BreadcrumbItem[]) => void;
  push: (item: BreadcrumbItem) => void;
  pop: () => void;
  replace: (items: BreadcrumbItem[]) => void;
}

const BreadcrumbContext = React.createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BreadcrumbItem[]>([]);

  const push = useCallback((item: BreadcrumbItem) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const pop = useCallback(() => {
    setItems((prev) => prev.slice(0, -1));
  }, []);

  const replace = useCallback((newItems: BreadcrumbItem[]) => {
    setItems(newItems);
  }, []);

  const value = useMemo(
    () => ({ items, setItems, push, pop, replace }),
    [items, push, pop, replace]
  );

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbs() {
  const context = React.useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumbs must be used within a BreadcrumbProvider');
  }
  return context;
}

// ============================================================================
// Utility: Build breadcrumbs from path
// ============================================================================

export interface PathSegment {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export function buildBreadcrumbsFromPath(
  path: string,
  labelMap?: Record<string, string>,
  iconMap?: Record<string, React.ReactNode>
): BreadcrumbItem[] {
  const segments = path.split('/').filter(Boolean);

  return segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = labelMap?.[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    const icon = iconMap?.[segment];

    return {
      id: href,
      label,
      href,
      icon,
      isCurrentPage: index === segments.length - 1,
    };
  });
}
