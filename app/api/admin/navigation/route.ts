/**
 * Admin Navigation API
 * GET - Get all navigation menus
 * POST - Create a menu or menu item
 */

import { badRequestError, createAdminRoute, successResponse } from "@/lib/api";
import { navigationRepository } from "@/lib/db/navigation";
import { z } from "zod";

const menuSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  location: z.enum(["header", "footer", "sidebar", "mobile"]),
});

const menuItemSchema = z.object({
  menu_id: z.string().uuid(),
  parent_id: z.string().uuid().optional().nullable(),
  label: z.string().min(1, "Label is required").max(100),
  url: z.string().min(1, "URL is required").max(500),
  target: z.enum(["_self", "_blank"]).default("_self"),
  icon: z.string().max(50).optional().nullable(),
  badge_text: z.string().max(20).optional().nullable(),
  badge_color: z.string().max(20).optional().nullable(),
  display_order: z.number().default(0),
  is_visible: z.boolean().default(true),
  visible_to: z.array(z.string()).default(["all"]),
});

/**
 * GET /api/admin/navigation
 * Get all navigation menus with items
 */
export const GET = createAdminRoute(async (request) => {
  const url = new URL(request.url);
  const menuId = url.searchParams.get("menuId");

  if (menuId) {
    const menu = await navigationRepository.getMenuById(menuId);
    return successResponse({ menu });
  }

  // Get all menus
  const menus = await navigationRepository.getAllMenus();

  // Get all items for each menu and flatten into a single array
  const allItems: Array<{
    id: string;
    menu_id: string;
    label: string;
    url: string;
    display_order: number;
    is_visible: boolean;
  }> = [];

  for (const menu of menus) {
    const menuWithItems = await navigationRepository.getMenuById(menu.id);
    if (menuWithItems?.items) {
      // Flatten nested items
      const flattenItems = (
        items: typeof menuWithItems.items,
        menuId: string
      ): void => {
        for (const item of items) {
          allItems.push({
            id: item.id,
            menu_id: menuId,
            label: item.label,
            url: item.url,
            display_order: item.display_order,
            is_visible: item.is_visible,
          });
          if (item.children?.length) {
            flattenItems(item.children, menuId);
          }
        }
      };
      flattenItems(menuWithItems.items, menu.id);
    }
  }

  return successResponse({ menus, items: allItems });
});

/**
 * POST /api/admin/navigation
 * Create a menu or menu item
 */
export const POST = createAdminRoute(async (request) => {
  const body = await request.json();
  const type = body.type; // 'menu' or 'item'

  if (type === "menu") {
    const parsed = menuSchema.safeParse(body);
    if (!parsed.success) {
      throw badRequestError(
        parsed.error.issues[0]?.message || "Invalid menu data"
      );
    }
    const menu = await navigationRepository.createMenu(
      parsed.data.name,
      parsed.data.location
    );
    return successResponse({ menu, message: "Menu created" }, 201);
  }

  if (type === "item") {
    const parsed = menuItemSchema.safeParse(body);
    if (!parsed.success) {
      throw badRequestError(
        parsed.error.issues[0]?.message || "Invalid menu item data"
      );
    }
    const item = await navigationRepository.addMenuItem(parsed.data);
    return successResponse({ item, message: "Menu item added" }, 201);
  }

  throw badRequestError('Invalid type: must be "menu" or "item"');
});
