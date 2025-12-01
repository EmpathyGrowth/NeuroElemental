/**
 * Admin Navigation Item API
 * PATCH - Update menu or menu item
 * DELETE - Delete menu or menu item
 */

import { badRequestError, createAdminRoute, successResponse } from "@/lib/api";
import { navigationRepository } from "@/lib/db/navigation";
import { z } from "zod";

const menuUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  is_active: z.boolean().optional(),
});

const menuItemUpdateSchema = z.object({
  parent_id: z.string().uuid().optional().nullable(),
  label: z.string().min(1).max(100).optional(),
  url: z.string().min(1).max(500).optional(),
  target: z.enum(["_self", "_blank"]).optional(),
  icon: z.string().max(50).optional().nullable(),
  badge_text: z.string().max(20).optional().nullable(),
  badge_color: z.string().max(20).optional().nullable(),
  display_order: z.number().optional(),
  is_visible: z.boolean().optional(),
  visible_to: z.array(z.string()).optional(),
});

/**
 * PATCH /api/admin/navigation/[id]
 * Update menu or menu item
 */
export const PATCH = createAdminRoute<{ id: string }>(
  async (request, context) => {
    const { id } = await context.params;
    const body = await request.json();
    const type = body.type; // 'menu' or 'item'

    if (type === "menu") {
      const parsed = menuUpdateSchema.safeParse(body);
      if (!parsed.success) {
        throw badRequestError(
          parsed.error.errors[0]?.message || "Invalid menu data"
        );
      }
      const menu = await navigationRepository.updateMenu(id, parsed.data);
      return successResponse({ menu, message: "Menu updated" });
    }

    if (type === "item") {
      const parsed = menuItemUpdateSchema.safeParse(body);
      if (!parsed.success) {
        throw badRequestError(
          parsed.error.errors[0]?.message || "Invalid menu item data"
        );
      }
      const item = await navigationRepository.updateMenuItem(id, parsed.data);
      return successResponse({ item, message: "Menu item updated" });
    }

    throw badRequestError('Invalid type: must be "menu" or "item"');
  }
);

/**
 * DELETE /api/admin/navigation/[id]
 * Delete menu or menu item
 */
export const DELETE = createAdminRoute<{ id: string }>(
  async (request, context) => {
    const { id } = await context.params;
    const url = new URL(request.url);
    const type = url.searchParams.get("type"); // 'menu' or 'item'

    if (type === "menu") {
      await navigationRepository.deleteMenu(id);
      return successResponse({ message: "Menu deleted" });
    }

    if (type === "item") {
      await navigationRepository.deleteMenuItem(id);
      return successResponse({ message: "Menu item deleted" });
    }

    throw badRequestError('Invalid type: must be "menu" or "item"');
  }
);
