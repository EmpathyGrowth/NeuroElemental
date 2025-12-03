"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/lib/utils";
import { History, RotateCcw, Eye, Loader2 } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

export interface ContentRevision {
  id: string;
  content_type: string;
  content_id: string;
  version: number;
  data: Record<string, unknown>;
  change_summary: string | null;
  created_by: string | null;
  created_at: string;
  user?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface ContentRevisionHistoryProps {
  entityType: string;
  entityId: string;
  onRestore?: (content: Record<string, unknown>) => void;
  className?: string;
}

// ============================================================================
// ContentRevisionHistory Component
// ============================================================================

export function ContentRevisionHistory({
  entityType,
  entityId,
  onRestore,
  className,
}: ContentRevisionHistoryProps) {
  const [revisions, setRevisions] = React.useState<ContentRevision[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedRevision, setSelectedRevision] = React.useState<ContentRevision | null>(null);
  const [restoring, setRestoring] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [confirmRestoreOpen, setConfirmRestoreOpen] = React.useState(false);

  React.useEffect(() => {
    fetchRevisions();
  }, [entityType, entityId]);

  const fetchRevisions = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/revisions?entityType=${entityType}&entityId=${entityId}`
      );
      if (!res.ok) throw new Error("Failed to fetch revisions");
      const data = await res.json();
      setRevisions(data.revisions || []);
    } catch (error) {
      console.error("Error fetching revisions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedRevision || !onRestore) return;

    setRestoring(true);
    try {
      const res = await fetch(`/api/admin/revisions/restore/${selectedRevision.id}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to restore revision");
      
      const data = await res.json();
      onRestore(data.content);
      setConfirmRestoreOpen(false);
      setSelectedRevision(null);
      fetchRevisions(); // Refresh to show new restore revision
    } catch (error) {
      console.error("Error restoring revision:", error);
    } finally {
      setRestoring(false);
    }
  };

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isRestoreRevision = (revision: ContentRevision): boolean => {
    return revision.change_summary?.includes("Restored from") || false;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (revisions.length === 0) {
    return (
      <div className={`text-center p-8 text-muted-foreground ${className}`}>
        <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No revision history available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-medium">Revision History</h3>
        <Badge variant="secondary">{revisions.length}</Badge>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {revisions.map((revision, index) => (
            <div
              key={revision.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={revision.user?.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(revision.user?.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {revision.user?.full_name || "Unknown User"}
                  </span>
                  {index === 0 && (
                    <Badge variant="default" className="text-xs">
                      Current
                    </Badge>
                  )}
                  {isRestoreRevision(revision) && (
                    <Badge variant="outline" className="text-xs">
                      Restored
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(revision.created_at)}
                </p>
                {revision.change_summary && !isRestoreRevision(revision) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {revision.change_summary}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Version {revision.version}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedRevision(revision);
                    setPreviewOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {index > 0 && onRestore && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedRevision(revision);
                      setConfirmRestoreOpen(true);
                    }}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Revision Preview</DialogTitle>
            <DialogDescription>
              {selectedRevision && formatDate(selectedRevision.created_at)}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
              {selectedRevision &&
                JSON.stringify(selectedRevision.data, null, 2)}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Confirm Restore Dialog */}
      <Dialog open={confirmRestoreOpen} onOpenChange={setConfirmRestoreOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Revision?</DialogTitle>
            <DialogDescription>
              This will replace the current content with the selected revision from{" "}
              {selectedRevision && formatDate(selectedRevision.created_at)}.
              A new revision will be created to track this change.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmRestoreOpen(false)}
              disabled={restoring}
            >
              Cancel
            </Button>
            <Button onClick={handleRestore} disabled={restoring}>
              {restoring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
