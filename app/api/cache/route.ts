import { createAdminRoute, getQueryParam, successResponse } from '@/lib/api';
import { cacheManager } from '@/lib/cache/cache-manager';

export const GET = createAdminRoute(async (_request, _context, _user) => {
  // Get cache statistics
  const stats = cacheManager.getStats();

  return successResponse({
    cache_stats: stats,
    message: 'Cache statistics retrieved',
  });
});

export const DELETE = createAdminRoute(async (_request, _context, _user) => {
  const namespace = getQueryParam(_request, 'namespace');
  const pattern = getQueryParam(_request, 'pattern');

  if (namespace) {
    // Clear specific namespace
    await cacheManager.clear(namespace);
    return successResponse({
      message: `Cache namespace '${namespace}' cleared successfully`,
    });
  } else if (pattern) {
    // Delete by pattern
    await cacheManager.invalidatePattern(pattern);
    return successResponse({
      message: `Cache keys matching pattern '${pattern}' deleted`,
    });
  } else {
    // Clear entire cache
    await cacheManager.clear();
    return successResponse({
      message: 'Cache cleared successfully',
    });
  }
});
