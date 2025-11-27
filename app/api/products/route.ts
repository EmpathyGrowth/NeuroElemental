import { conflictError, formatPaginationMeta, getBooleanParam, getPaginationParams, getQueryParam, internalError, parseBodyWithValidation, successResponse, createAdminRoute } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { logger } from '@/lib/logging';

/** Product record */
interface ProductRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  price_usd: number;
  is_active: boolean | null;
  metadata: Record<string, unknown> | null;
  stripe_price_id: string | null;
  created_at: string | null;
}

/** Product ID result */
interface ProductIdResult {
  id: string;
}

/** Product insert data - matches Supabase schema */
type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

interface ProductInsert {
  name: string;
  slug: string;
  description?: string | null;
  type: string;
  price_usd: number;
  is_active?: boolean | null;
  metadata?: Json | null;
  stripe_price_id?: string | null;
  created_at?: string | null;
}

export const GET = createAdminRoute(async (request, _context, _admin) => {
  const supabase = getSupabaseServer();

  const search = getQueryParam(request, 'search');
  const type = getQueryParam(request, 'type');
  const isActive = getBooleanParam(request, 'active', false);
  const { limit, offset } = getPaginationParams(request, { limit: 20 });

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' });

  // Apply filters
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  if (type) {
    query = query.eq('type', type);
  }

  if (isActive !== null && isActive !== false) {
    query = query.eq('is_active', isActive);
  }

  // Apply pagination
  query = query
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  const { data: products, error, count } = await query as { data: ProductRecord[] | null; error: { message: string } | null; count: number | null };

  if (error) {
    logger.error('Error fetching products', undefined, { errorMsg: error.message });
    throw internalError('Failed to fetch products');
  }

  // Calculate aggregate stats
  const stats = {
    total: count || 0,
    active: products?.filter((p) => p.is_active).length || 0,
  };

  return successResponse({
    products: products || [],
    stats,
    pagination: formatPaginationMeta(count || 0, limit, offset),
  });
});

export const POST = createAdminRoute(async (request, _context, _admin) => {
  const supabase = getSupabaseServer();

  const body = await parseBodyWithValidation(request, ['name', 'slug', 'type', 'price_usd']) as {
    name: string;
    slug: string;
    description?: string;
    type: string;
    price_usd: number;
    is_active?: boolean;
    metadata?: Record<string, unknown>;
    stripe_price_id?: string;
  };
  const {
    name,
    slug,
    description,
    type,
    price_usd,
    is_active = false,
    metadata = {},
    stripe_price_id,
  } = body;

  // Check if slug already exists
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('slug', slug)
    .single() as { data: ProductIdResult | null; error: unknown };

  if (existing) {
    throw conflictError('Product with this slug already exists');
  }

  // Create product
  const productData: ProductInsert = {
    name,
    slug,
    description,
    type,
    price_usd,
    is_active,
    metadata: metadata as Json,
    stripe_price_id,
  };

  const { data: product, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single() as { data: ProductRecord | null; error: { message: string } | null };

  if (error) {
    logger.error('Error creating product', undefined, { errorMsg: error.message });
    throw internalError('Failed to create product');
  }

  return successResponse({ product }, 201);
});

