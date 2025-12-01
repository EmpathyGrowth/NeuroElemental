"use client";

/**
 * API Keys Management Page
 * View and manage API keys for programmatic access
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { logger } from "@/lib/logging";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Key,
  Trash2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  user: {
    full_name: string;
    email: string;
  };
}

interface ScopeGroup {
  category: string;
  scopes: Array<{
    scope: string;
    description: string;
  }>;
}

const SCOPE_GROUPS: ScopeGroup[] = [
  {
    category: "Credits Management",
    scopes: [
      {
        scope: "credits:read",
        description: "Read credit balance and transactions",
      },
      { scope: "credits:write", description: "Add or subtract credits" },
    ],
  },
  {
    category: "Member Management",
    scopes: [
      { scope: "members:read", description: "View organization members" },
      { scope: "members:write", description: "Invite and manage members" },
    ],
  },
  {
    category: "Organization",
    scopes: [
      { scope: "org:read", description: "Read organization details" },
      { scope: "org:write", description: "Update organization settings" },
    ],
  },
  {
    category: "Analytics & Reporting",
    scopes: [
      { scope: "analytics:read", description: "Access analytics and reports" },
    ],
  },
  {
    category: "Courses",
    scopes: [
      { scope: "courses:read", description: "View course information" },
      { scope: "courses:enroll", description: "Enroll users in courses" },
    ],
  },
];

export default function ApiKeysPage() {
  const params = useParams();
  const _router = useRouter();
  const organizationId = params.id as string;

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  // Create key form state
  const [keyName, setKeyName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<Set<string>>(new Set());
  const [expiresInDays, setExpiresInDays] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  useEffect(() => {
    fetchKeys();
  }, [organizationId]);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/organizations/${organizationId}/api-keys`);

      if (!res.ok) {
        throw new Error("Failed to fetch API keys");
      }

      const data = await res.json();
      setKeys(data.keys || []);
    } catch (error: unknown) {
      logger.error(
        "Error fetching API keys",
        error instanceof Error ? error : undefined,
        { errorMsg: String(error) }
      );
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!keyName.trim()) {
      toast.error("Please provide a name for the API key");
      return;
    }

    if (selectedScopes.size === 0) {
      toast.error("Please select at least one scope");
      return;
    }

    try {
      setCreating(true);
      const res = await fetch(`/api/organizations/${organizationId}/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: keyName.trim(),
          scopes: Array.from(selectedScopes),
          expiresInDays: expiresInDays,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create API key");
      }

      const data = await res.json();
      setNewKey(data.apiKey);
      setKeys([data.keyData, ...keys]);

      // Reset form
      setKeyName("");
      setSelectedScopes(new Set());
      setExpiresInDays(null);

      toast.success("API Key Created", {
        description: "Your API key has been created. Make sure to copy it now!",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      logger.error(
        "Error creating API key",
        error instanceof Error ? error : undefined,
        { errorMsg: String(error) }
      );
      toast.error(message || "Failed to create API key");
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/api-keys/${keyId}`,
        {
          method: "PATCH",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to revoke API key");
      }

      setKeys(
        keys.map((key) =>
          key.id === keyId ? { ...key, is_active: false } : key
        )
      );

      toast.success("API Key Revoked", {
        description: "The API key has been revoked and can no longer be used",
      });
    } catch (error: unknown) {
      logger.error(
        "Error revoking API key",
        error instanceof Error ? error : undefined,
        { errorMsg: String(error) }
      );
      toast.error("Failed to revoke API key");
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/api-keys/${keyId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete API key");
      }

      setKeys(keys.filter((key) => key.id !== keyId));

      toast.success("API Key Deleted", {
        description: "The API key has been permanently deleted",
      });
    } catch (error: unknown) {
      logger.error(
        "Error deleting API key",
        error instanceof Error ? error : undefined,
        { errorMsg: String(error) }
      );
      toast.error("Failed to delete API key");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied", {
      description: "API key copied to clipboard",
    });
  };

  const toggleScope = (scope: string) => {
    const newScopes = new Set(selectedScopes);
    if (newScopes.has(scope)) {
      newScopes.delete(scope);
    } else {
      newScopes.add(scope);
    }
    setSelectedScopes(newScopes);
  };

  const toggleKeyExpanded = (keyId: string) => {
    const newExpanded = new Set(expandedKeys);
    if (newExpanded.has(keyId)) {
      newExpanded.delete(keyId);
    } else {
      newExpanded.add(keyId);
    }
    setExpandedKeys(newExpanded);
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Key className="h-8 w-8" />
            API Keys
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage API keys for programmatic access to your organization
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Key className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Create a new API key for programmatic access. Select the
                permissions this key should have.
              </DialogDescription>
            </DialogHeader>

            {newKey ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900">
                        API Key Created Successfully
                      </h3>
                      <p className="text-sm text-green-700 mt-1">
                        Make sure to copy your API key now. You won't be able to
                        see it again!
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Your API Key</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newKey}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      onClick={() => copyToClipboard(newKey)}
                      variant="outline"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-900">
                        Security Warning
                      </h3>
                      <p className="text-sm text-amber-700 mt-1">
                        Store this API key securely. Anyone with this key can
                        access your organization's data within the granted
                        scopes.
                      </p>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    onClick={() => {
                      setNewKey(null);
                      setCreateDialogOpen(false);
                    }}
                  >
                    Done
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="keyName">Key Name *</Label>
                  <Input
                    id="keyName"
                    placeholder="e.g., Production API, Testing, Mobile App"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    A descriptive name to help you identify this key
                  </p>
                </div>

                <div>
                  <Label htmlFor="expiresInDays">Expires In (Days)</Label>
                  <Input
                    id="expiresInDays"
                    type="number"
                    placeholder="Optional - leave empty for no expiration"
                    value={expiresInDays || ""}
                    onChange={(e) =>
                      setExpiresInDays(
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    min={1}
                    max={365}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Set an expiration date for enhanced security (1-365 days)
                  </p>
                </div>

                <div>
                  <Label>Scopes *</Label>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">
                    Select the permissions this API key should have
                  </p>

                  <div className="space-y-4">
                    {SCOPE_GROUPS.map((group) => (
                      <div
                        key={group.category}
                        className="border rounded-lg p-4"
                      >
                        <h3 className="font-semibold mb-3">{group.category}</h3>
                        <div className="space-y-2">
                          {group.scopes.map((scopeItem) => (
                            <div
                              key={scopeItem.scope}
                              className="flex items-start gap-2"
                            >
                              <Checkbox
                                id={scopeItem.scope}
                                checked={selectedScopes.has(scopeItem.scope)}
                                onCheckedChange={() =>
                                  toggleScope(scopeItem.scope)
                                }
                              />
                              <div className="flex-1">
                                <Label
                                  htmlFor={scopeItem.scope}
                                  className="font-mono text-sm cursor-pointer"
                                >
                                  {scopeItem.scope}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  {scopeItem.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateKey}
                    disabled={
                      creating || !keyName.trim() || selectedScopes.size === 0
                    }
                  >
                    {creating ? "Creating..." : "Create API Key"}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Loading API keys...
            </p>
          </CardContent>
        </Card>
      ) : keys.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No API Keys</h3>
              <p className="text-muted-foreground mb-4">
                Create your first API key to start using the API
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Key className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {keys.map((key) => {
            const expired = isExpired(key.expires_at);
            const isExpanded = expandedKeys.has(key.id);

            return (
              <Card
                key={key.id}
                className={!key.is_active || expired ? "opacity-60" : ""}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{key.name}</CardTitle>
                        {!key.is_active && (
                          <Badge variant="destructive">Revoked</Badge>
                        )}
                        {expired && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                        {key.is_active && !expired && (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            Active
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="mt-2">
                        <span className="font-mono text-xs">
                          {key.key_prefix}
                        </span>
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleKeyExpanded(key.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>

                      {key.is_active && !expired && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Revoke
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Revoke API Key?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will immediately disable the API key. Any
                                applications using this key will no longer be
                                able to access your organization's data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRevokeKey(key.id)}
                              >
                                Revoke Key
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete API Key?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the API key. This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteKey(key.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Permanently
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-4 border-t pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Created By
                        </Label>
                        <p className="text-sm font-medium mt-1">
                          {key.user.full_name || key.user.email}
                        </p>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Created At
                        </Label>
                        <p className="text-sm font-medium mt-1">
                          {formatDistanceToNow(new Date(key.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Last Used
                        </Label>
                        <p className="text-sm font-medium mt-1">
                          {key.last_used_at ? (
                            formatDistanceToNow(new Date(key.last_used_at), {
                              addSuffix: true,
                            })
                          ) : (
                            <span className="text-muted-foreground">Never</span>
                          )}
                        </p>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Expires
                        </Label>
                        <p className="text-sm font-medium mt-1">
                          {key.expires_at ? (
                            <span className={expired ? "text-red-600" : ""}>
                              {formatDistanceToNow(new Date(key.expires_at), {
                                addSuffix: true,
                              })}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Never</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Scopes
                      </Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {key.scopes.map((scope) => (
                          <Badge
                            key={scope}
                            variant="secondary"
                            className="font-mono text-xs"
                          >
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
