"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logger } from "@/lib/logging";
import { cn } from "@/lib/utils";
import {
  Check,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Search,
  Upload,
} from "lucide-react";
import * as React from "react";

interface MediaItem {
  id: string;
  filename: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  public_url: string;
  alt_text?: string;
  folder: string;
  width?: number;
  height?: number;
  created_at: string;
}

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string, item?: MediaItem) => void;
  category?: string;
  /** Reserved for future multi-select feature */
  _multiple?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
  category,
  _multiple = false,
}: MediaPickerProps) {
  const [items, setItems] = React.useState<MediaItem[]>([]);
  const [folders, setFolders] = React.useState<string[]>(["uploads"]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [selectedFolder, setSelectedFolder] = React.useState<string>("");
  const [selectedItem, setSelectedItem] = React.useState<MediaItem | null>(
    null
  );
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Fetch media items
  const fetchMedia = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedFolder) params.set("folder", selectedFolder);
      params.set("type", "image"); // Only show images

      const res = await fetch(`/api/admin/media?${params}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setFolders(data.folders || ["uploads"]);
      }
    } catch (error) {
      logger.error(
        "Failed to fetch media",
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      setLoading(false);
    }
  }, [search, selectedFolder]);

  React.useEffect(() => {
    if (open) {
      fetchMedia();
    }
  }, [open, fetchMedia]);

  // Handle new upload
  const handleUpload = async (file: File) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadCategory = category || "general";
      const response = await fetch(
        `/api/upload/image?category=${uploadCategory}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        // Refresh the media list
        fetchMedia();
      }
    } catch (error) {
      logger.error(
        "Upload failed",
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSelect = () => {
    if (selectedItem) {
      onSelect(selectedItem.public_url, selectedItem);
      onOpenChange(false);
      setSelectedItem(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
          <DialogDescription>
            Select an image from your library or upload a new one
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="library" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="library" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Library
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="library"
            className="flex-1 flex flex-col min-h-0 mt-4"
          >
            {/* Search and Filters */}
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search media..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="px-3 py-2 rounded-md border bg-background text-sm"
              >
                <option value="">All Folders</option>
                {folders.map((folder) => (
                  <option key={folder} value={folder}>
                    {folder}
                  </option>
                ))}
              </select>
            </div>

            {/* Media Grid */}
            <ScrollArea className="flex-1 -mx-6 px-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No images found</p>
                  <p className="text-sm text-muted-foreground/70">
                    Upload some images or adjust your search
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pb-4">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className={cn(
                        "relative aspect-square rounded-lg overflow-hidden border-2 transition-all group",
                        selectedItem?.id === item.id
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent hover:border-muted-foreground/30"
                      )}
                    >
                      <img
                        src={item.public_url}
                        alt={item.alt_text || item.filename}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      {selectedItem?.id === item.id && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="bg-primary text-primary-foreground rounded-full p-1">
                            <Check className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-xs text-white truncate">
                          {item.original_filename}
                        </p>
                        <p className="text-xs text-white/70">
                          {formatFileSize(item.file_size)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Selected item info & actions */}
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <div className="text-sm text-muted-foreground">
                {selectedItem ? (
                  <span>
                    Selected: <strong>{selectedItem.original_filename}</strong>
                    {selectedItem.width && selectedItem.height && (
                      <span className="ml-2">
                        ({selectedItem.width}×{selectedItem.height})
                      </span>
                    )}
                  </span>
                ) : (
                  <span>No image selected</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSelect} disabled={!selectedItem}>
                  Select Image
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="flex-1 mt-4">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer",
                "hover:border-primary hover:bg-primary/5",
                uploading && "pointer-events-none opacity-50"
              )}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                }}
                className="hidden"
              />

              {uploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-lg font-medium">Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG, GIF, WebP or SVG up to 10MB
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

/**
 * MediaPickerButton - Standalone button to open media picker
 */
interface MediaPickerButtonProps {
  onSelect: (url: string, item?: MediaItem) => void;
  category?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
}

export function MediaPickerButton({
  onSelect,
  category,
  className,
  variant = "outline",
  size = "default",
  children,
}: MediaPickerButtonProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        className={className}
      >
        {children || (
          <>
            <FolderOpen className="h-4 w-4 mr-2" />
            Browse Library
          </>
        )}
      </Button>
      <MediaPicker
        open={open}
        onOpenChange={setOpen}
        onSelect={onSelect}
        category={category}
      />
    </>
  );
}
