/**
 * Product API Routes
 * GET (public), PUT, DELETE (admin) for individual products
 */

import { createAdminRoute, createPublicRoute, internalError, notFoundError, successResponse, validateRequest } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { getCurrentTimestamp, getUpdateTimestamp } from '@/lib/utils';
import { productUpdateSchema } from '@/lib/validation/schemas';

/** Product data from database */
interface Product {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  is_active: boolean;
  product_type: string;
  sales_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * GET /api/products/[id]
 * Get a single product (public)
 */
export const GET = createPublicRoute<{ id: string }>(async (_request, context) => {
  const { id } = await context.params;
  const supabase = await getSupabaseServer();

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single() as { data: Product | null; error: { message: string } | null };

  if (error || !product) {
    throw notFoundError('Product');
  }

  return successResponse({ product });
});

/**
 * PUT /api/products/[id]
 * Update a product (admin only)
 */
export const PUT = createAdminRoute<{ id: string }>(async (request, context, _admin) => {
  const { id } = await context.params;
  const supabase = await getSupabaseServer();

  // Validate request body
  const validation = await validateRequest(request, productUpdateSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const updateData = {
    ...validation.data,
    ...getUpdateTimestamp(),
  };

  const { data: product, error } = await (supabase as any)
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single() as { data: Product | null; error: { message: string } | null };

  if (error || !product) {
    throw notFoundError('Product');
  }

  return successResponse({ product });
});

/**
 * DELETE /api/products/[id]
 * Soft delete a product (admin only)
 */
export const DELETE = createAdminRoute<{ id: string }>(async (_request, context, _admin) => {
  const { id } = await context.params;
  const supabase = await getSupabaseServer();

  // Check if product exists
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('id')
    .eq('id', id)
    .single();

  if (fetchError || !product) {
    throw notFoundError('Product');
  }

  // Soft delete by setting is_active to false and adding deleted_at
  const { error } = await (supabase as any)
    .from('products')
    .update({
      is_active: false,
      deleted_at: getCurrentTimestamp(),
      ...getUpdateTimestamp(),
    })
    .eq('id', id);

  if (error) {
    throw internalError('Failed to delete product');
  }

  return successResponse({ message: 'Product deleted successfully' });
});
