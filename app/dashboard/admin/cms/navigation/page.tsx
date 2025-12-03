"use client";

import { AdminPageHeader } from "@/components/dashboard/admin-page-header";
import { AdminPageShell } from "@/components/dashboard/admin-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { useToast } from "@/components/ui/use-toast";
import { logger } from "@/lib/logging";
import { Loader2, Navigation, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { DragDropList, DragHandle, updateDisplayOrder } from "@/components/ui/drag-drop-list";

interface NavMenu {
  id: string;
  name: string;
  location: string;
  is_active: boolean;
}

interface NavItem {
  id: string;
  menu_id: string;
  label: string;
  url: string;
  display_order: number;
  is_visible: boolean;
}

export default function NavigationPage() {
  const [menus, setMenus] = useState<NavMenu[]>([]);
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [_selectedMenu, _setSelectedMenu] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", location: "header" });
  const [itemFormData, setItemFormData] = useState({
    label: "",
    url: "",
    menu_id: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/navigation");
      const data = await res.json();
      setMenus(data.menus || []);
      setItems(data.items || []);
    } catch (error) {
      logger.error(
        "Error fetching navigation",
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "menu", ...formData }),
      });
      toast({ title: "Menu created" });
      setDialogOpen(false);
      setFormData({ name: "", location: "header" });
      fetchData();
    } catch {
      toast({
        title: "Error",
        description: "Failed to create menu",
        variant: "destructive",
      });
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "item", ...itemFormData }),
      });
      toast({ title: "Item added" });
      setItemDialogOpen(false);
      setItemFormData({ label: "", url: "", menu_id: "" });
      fetchData();
    } catch {
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm("Delete this menu and all its items?")) return;
    try {
      await fetch(`/api/admin/navigation/${id}?type=menu`, {
        method: "DELETE",
      });
      toast({ title: "Menu deleted" });
      fetchData();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await fetch(`/api/admin/navigation/${id}?type=item`, {
        method: "DELETE",
      });
      toast({ title: "Item deleted" });
      fetchData();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleReorderItems = async (menuId: string, reorderedItems: NavItem[]) => {
    // Update local state immediately for responsive UI
    const updatedItems = updateDisplayOrder(reorderedItems);
    setItems((prev) => {
      const otherItems = prev.filter((i) => i.menu_id !== menuId);
      return [...otherItems, ...updatedItems];
    });

    // Persist to API
    try {
      await fetch("/api/admin/navigation/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: updatedItems.map((item) => ({
            id: item.id,
            display_order: item.display_order,
          })),
        }),
      });
      toast({ title: "Order updated" });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save order",
        variant: "destructive",
      });
      // Revert on error
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Navigation"
        description="Manage site menus and navigation links"
        actions={
          <div className="flex gap-2">
            <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Menu Item</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateItem} className="space-y-4">
                  <div>
                    <Label>Menu</Label>
                    <Select
                      value={itemFormData.menu_id}
                      onValueChange={(v) =>
                        setItemFormData({ ...itemFormData, menu_id: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select menu" />
                      </SelectTrigger>
                      <SelectContent>
                        {menus.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Label</Label>
                    <Input
                      value={itemFormData.label}
                      onChange={(e) =>
                        setItemFormData({
                          ...itemFormData,
                          label: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>URL</Label>
                    <Input
                      value={itemFormData.url}
                      onChange={(e) =>
                        setItemFormData({
                          ...itemFormData,
                          url: e.target.value,
                        })
                      }
                      placeholder="/page"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Add Item
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Add Menu
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Menu</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateMenu} className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(v) =>
                        setFormData({ ...formData, location: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="header">Header</SelectItem>
                        <SelectItem value="footer">Footer</SelectItem>
                        <SelectItem value="sidebar">Sidebar</SelectItem>
                        <SelectItem value="mobile">Mobile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    Create Menu
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {menus.length === 0 ? (
        <Card className="glass-card border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Navigation className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No menus yet</h3>
            <p className="text-muted-foreground">
              Create your first navigation menu.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {menus.map((menu) => (
            <Card key={menu.id} className="glass-card border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{menu.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{menu.location}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteMenu(menu.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {items.filter((i) => i.menu_id === menu.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No items in this menu
                  </p>
                ) : (
                  <DragDropList
                    items={items
                      .filter((i) => i.menu_id === menu.id)
                      .sort((a, b) => a.display_order - b.display_order)}
                    keyField="id"
                    onReorder={(reordered) => handleReorderItems(menu.id, reordered)}
                    renderItem={({ item, dragHandleProps }) => (
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                        <DragHandle {...dragHandleProps} />
                        <span className="text-sm flex-1">{item.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.url}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminPageShell>
  );
}
