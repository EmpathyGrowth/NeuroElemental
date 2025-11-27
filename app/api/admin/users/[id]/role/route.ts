import { createAdminRoute, internalError, successResponse, validateEnum } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { getUpdateTimestamp } from '@/lib/utils';
import type { Database } from '@/lib/types/supabase';

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export const PATCH = createAdminRoute<{ id: string }>(async (request, context, _admin) => {
  const { id } = await context.params;
  const { role } = await request.json();

  // Validate role
  const validRoles = ['registered', 'student', 'instructor', 'business', 'school', 'admin'] as const;
  if (role) {
    validateEnum(role, [...validRoles], 'role');
  }

  const supabase = getSupabaseServer();

  // Build update data with proper typing
  const updateData: ProfileUpdate = {
    ...(role && { role: role as ProfileRow['role'] }),
    ...getUpdateTimestamp(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw internalError(error.message);
  }

  return successResponse(data);
});
