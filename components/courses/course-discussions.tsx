"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle,
  Clock,
  HelpCircle,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  ThumbsUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Discussion {
  id: string;
  lesson_id: string | null;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  title: string;
  content: string;
  type: "question" | "discussion";
  is_answered: boolean;
  upvotes: number;
  created_at: string;
  updated_at: string;
  replies: Reply[];
}

interface Reply {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  content: string;
  is_answer: boolean;
  upvotes: number;
  created_at: string;
}

interface CourseDiscussionsProps {
  courseId: string;
  lessonId?: string;
}

export function CourseDiscussions({
  courseId,
  lessonId,
}: CourseDiscussionsProps) {
  const { isAuthenticated } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "questions" | "discussions">(
    "all"
  );

  // New discussion form
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState<"question" | "discussion">("question");

  useEffect(() => {
    fetchDiscussions();
  }, [courseId]);

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/discussions`);
      if (res.ok) {
        const data = await res.json();
        setDiscussions(data.discussions || []);
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/discussions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          type: newType,
          lesson_id: lessonId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDiscussions([data.discussion, ...discussions]);
        setNewTitle("");
        setNewContent("");
        setDialogOpen(false);
        toast.success("Discussion created!");
      } else {
        toast.error("Failed to create discussion");
      }
    } catch {
      toast.error("Failed to create discussion");
    } finally {
      setCreating(false);
    }
  };

  const filteredDiscussions = discussions.filter((d) => {
    if (filter === "all") return true;
    if (filter === "questions") return d.type === "question";
    return d.type === "discussion";
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Discussions
          <Badge variant="secondary">{discussions.length}</Badge>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select
            value={filter}
            onValueChange={(v) => setFilter(v as typeof filter)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="questions">Questions</SelectItem>
              <SelectItem value="discussions">Discussions</SelectItem>
            </SelectContent>
          </Select>

          {isAuthenticated && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Start a Discussion</DialogTitle>
                  <DialogDescription>
                    Ask a question or start a discussion about this course
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={newType}
                      onValueChange={(v) => setNewType(v as typeof newType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="question">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4" />
                            Question
                          </div>
                        </SelectItem>
                        <SelectItem value="discussion">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Discussion
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="What's your question or topic?"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Details</Label>
                    <Textarea
                      id="content"
                      placeholder="Provide more details..."
                      rows={4}
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateDiscussion} disabled={creating}>
                    {creating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Post
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filteredDiscussions.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-1">No discussions yet</h3>
            <p className="text-sm text-muted-foreground">
              Be the first to start a discussion!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDiscussions.map((discussion) => (
              <div
                key={discussion.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={discussion.user_avatar || undefined} />
                    <AvatarFallback>
                      {getInitials(discussion.user_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={
                          discussion.type === "question"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {discussion.type === "question" ? (
                          <HelpCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <MessageSquare className="w-3 h-3 mr-1" />
                        )}
                        {discussion.type}
                      </Badge>
                      {discussion.is_answered && (
                        <Badge
                          variant="outline"
                          className="text-green-600 text-xs"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Answered
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium mb-1">{discussion.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {discussion.content}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{discussion.user_name}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(discussion.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {discussion.upvotes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {discussion.replies.length} replies
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
