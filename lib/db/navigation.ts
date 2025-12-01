/**
 * Navigation Repository
 * Manages navigation menus and menu items
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { getSupabaseServer } from "./supabase-server";

/** Menu locations */
export type MenuLocation = "header" | "footer" | "sidebar" | "mobile";

/** Link target */
export type LinkTarget = "_self" | "_blank";

/** Navigation menu */
export interface NavigationMenu {
  id: string;
  name: string;
  location: MenuLocation;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Navigation menu item */
export interface NavigationMenuItem {
  id: string;
  menu_id: string;
  parent_id: string | null;
  label: string;
  url: string;
  target: LinkTarget;
  icon: string | null;
  badge_text: string | null;
  badge_color: string | null;
  display_order: number;
  is_visible: boolean;
  visible_to: string[];
  created_at: string;
  updated_at: string;
}

/** Menu item with children */
export interface NavigationMenuItemWithChildren extends NavigationMenuItem {
  children: NavigationMenuItemWithChildren[];
}

/** Menu with items */
export interface NavigationMenuWithItems extends NavigationMenu {
  items: NavigationMenuItemWithChildren[];
}

/** Menu item insert */
export interface NavigationMenuItemInsert {
  menu_id: string;
  parent_id?: string | null;
  label: string;
  url: string;
  target?: LinkTarget;
  icon?: string | null;
  badge_text?: string | null;
  badge_color?: string | null;
  display_order?: number;
  is_visible?: boolean;
  visible_to?: string[];
}

/** Menu item update */
export interface NavigationMenuItemUpdate {
  parent_id?: string | null;
  label?: string;
  url?: string;
  target?: LinkTarget;
  icon?: string | null;
  badge_text?: string | null;
  badge_color?: string | null;
  display_order?: number;
  is_visible?: boolean;
  visible_to?: string[];
}

/**
 * Navigation Repository
 */
export class NavigationRepository {
  private get supabase() {
     
    return getSupabaseServer() as any;
  }

  /**
   * Get menu by location with nested items
   */
  async getMenuByLocation(
    location: MenuLocation,
    userRole?: string
  ): Promise<NavigationMenuWithItems | null> {
    // Get the menu
    const { data: menu, error: menuError } = await this.supabase
      .from("navigation_menus")
      .select("*")
      .eq("location", location)
      .eq("is_active", true)
      .single();

    if (menuError || !menu) {
      return null;
    }

    // Get menu items
    const { data: items, error: itemsError } = await this.supabase
      .from("navigation_menu_items")
      .select("*")
      .eq("menu_id", menu.id)
      .eq("is_visible", true)
      .order("display_order", { ascending: true });

    if (itemsError) {
      logger.error("Error fetching menu items", itemsError);
      return { ...menu, items: [] } as NavigationMenuWithItems;
    }

    // Filter by role visibility
    let filteredItems = items as NavigationMenuItem[];
    if (userRole) {
      filteredItems = filteredItems.filter(
        (item) =>
          item.visible_to.includes("all") || item.visible_to.includes(userRole)
      );
    }

    // Build nested structure
    const nestedItems = this.buildNestedItems(filteredItems);

    return { ...menu, items: nestedItems } as NavigationMenuWithItems;
  }

  /**
   * Get all menus (admin)
   */
  async getAllMenus(): Promise<NavigationMenu[]> {
    const { data, error } = await this.supabase
      .from("navigation_menus")
      .select("*")
      .order("location", { ascending: true });

    if (error) {
      logger.error("Error fetching all menus", error);
      return [];
    }

    return (data || []) as NavigationMenu[];
  }

  /**
   * Get menu by ID with items (admin)
   */
  async getMenuById(menuId: string): Promise<NavigationMenuWithItems | null> {
    const { data: menu, error: menuError } = await this.supabase
      .from("navigation_menus")
      .select("*")
      .eq("id", menuId)
      .single();

    if (menuError || !menu) {
      return null;
    }

    const { data: items, error: itemsError } = await this.supabase
      .from("navigation_menu_items")
      .select("*")
      .eq("menu_id", menuId)
      .order("display_order", { ascending: true });

    if (itemsError) {
      logger.error("Error fetching menu items", itemsError);
      return { ...menu, items: [] } as NavigationMenuWithItems;
    }

    const nestedItems = this.buildNestedItems(items as NavigationMenuItem[]);

    return { ...menu, items: nestedItems } as NavigationMenuWithItems;
  }

  /**
   * Create a menu
   */
  async createMenu(
    name: string,
    location: MenuLocation
  ): Promise<NavigationMenu> {
    const { data, error } = await this.supabase
      .from("navigation_menus")
      .insert({ name, location })
      .select()
      .single();

    if (error || !data) {
      logger.error("Error creating menu", error);
      throw internalError("Failed to create menu");
    }

    return data as NavigationMenu;
  }

  /**
   * Update a menu
   */
  async updateMenu(
    menuId: string,
    updates: { name?: string; is_active?: boolean }
  ): Promise<NavigationMenu> {
    const { data, error } = await this.supabase
      .from("navigation_menus")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", menuId)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error updating menu", error);
      throw internalError("Failed to update menu");
    }

    return data as NavigationMenu;
  }

  /**
   * Delete a menu
   */
  async deleteMenu(menuId: string): Promise<void> {
    const { error } = await this.supabase
      .from("navigation_menus")
      .delete()
      .eq("id", menuId);

    if (error) {
      logger.error("Error deleting menu", error);
      throw internalError("Failed to delete menu");
    }
  }

  /**
   * Add menu item
   */
  async addMenuItem(
    item: NavigationMenuItemInsert
  ): Promise<NavigationMenuItem> {
    const { data, error } = await this.supabase
      .from("navigation_menu_items")
      .insert(item)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error adding menu item", error);
      throw internalError("Failed to add menu item");
    }

    return data as NavigationMenuItem;
  }

  /**
   * Update menu item
   */
  async updateMenuItem(
    itemId: string,
    updates: NavigationMenuItemUpdate
  ): Promise<NavigationMenuItem> {
    const { data, error } = await this.supabase
      .from("navigation_menu_items")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", itemId)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error updating menu item", error);
      throw internalError("Failed to update menu item");
    }

    return data as NavigationMenuItem;
  }

  /**
   * Delete menu item
   */
  async deleteMenuItem(itemId: string): Promise<void> {
    const { error } = await this.supabase
      .from("navigation_menu_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      logger.error("Error deleting menu item", error);
      throw internalError("Failed to delete menu item");
    }
  }

  /**
   * Reorder menu items
   */
  async reorderItems(orderedIds: string[]): Promise<void> {
    for (let i = 0; i < orderedIds.length; i++) {
      await this.supabase
        .from("navigation_menu_items")
        .update({ display_order: i + 1 })
        .eq("id", orderedIds[i]);
    }
  }

  /**
   * Build nested item structure
   */
  private buildNestedItems(
    items: NavigationMenuItem[]
  ): NavigationMenuItemWithChildren[] {
    const itemMap = new Map<string, NavigationMenuItemWithChildren>();
    const rootItems: NavigationMenuItemWithChildren[] = [];

    // First pass: create all items with empty children
    for (const item of items) {
      itemMap.set(item.id, { ...item, children: [] });
    }

    // Second pass: build hierarchy
    for (const item of items) {
      const itemWithChildren = itemMap.get(item.id)!;
      if (item.parent_id && itemMap.has(item.parent_id)) {
        itemMap.get(item.parent_id)!.children.push(itemWithChildren);
      } else {
        rootItems.push(itemWithChildren);
      }
    }

    return rootItems;
  }
}

/** Singleton instance */
export const navigationRepository = new NavigationRepository();
