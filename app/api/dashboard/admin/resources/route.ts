/**
 * Admin Resources API Route
 * Fetch instructor resources for admin management
 */

import { createAdminRoute, successResponse } from '@/lib/api'
import { getSupabaseServer } from '@/lib/db'
import { logger } from '@/lib/logging'

interface ResourceDownload {
  resource_id: string
}

/**
 * GET /api/dashboard/admin/resources
 * Get all instructor resources (admin only)
 */
export const GET = createAdminRoute(async (request) => {
  const supabase = getSupabaseServer()
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const typeFilter = searchParams.get('type') || 'all'
  const categoryFilter = searchParams.get('category') || 'all'

  try {
    // Fetch resources from instructor_resources table
    let query = supabase
      .from('instructor_resources')
      .select('id, title, description, file_url, resource_type, category, certification_level, created_at, created_by')

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`)
    }

    // Apply type filter
    if (typeFilter && typeFilter !== 'all') {
      query = query.eq('resource_type', typeFilter)
    }

    // Apply category filter
    if (categoryFilter && categoryFilter !== 'all') {
      query = query.eq('category', categoryFilter)
    }

    const { data: resources, error } = await query.order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching resources:', error)
      return successResponse({ resources: [], stats: getDefaultStats(), categories: [] })
    }

    // Try to get download counts if there's a resource_downloads table
    // Fall back to mock data if table doesn't exist
    const downloadCounts: Record<string, number> = {}
    try {
      const resourceIds = resources?.map(r => r.id) || []
      if (resourceIds.length > 0) {
        const { data: downloads } = await supabase
          .from('resource_downloads')
          .select('resource_id')
          .in('resource_id', resourceIds) as { data: ResourceDownload[] | null; error: unknown }

        if (downloads) {
          downloads.forEach(d => {
            downloadCounts[d.resource_id] = (downloadCounts[d.resource_id] || 0) + 1
          })
        }
      }
    } catch {
      // Table doesn't exist, use empty counts
      logger.info('resource_downloads table not found, using zero counts')
    }

    // Get unique categories for filter dropdown
    const categories = [...new Set(resources?.map(r => r.category).filter(Boolean) || [])]

    // Transform resources to response format
    const formattedResources = resources?.map(resource => {
      // Determine icon type based on resource_type
      const type = resource.resource_type?.toLowerCase().includes('video')
        ? 'video'
        : (resource.resource_type?.toLowerCase().includes('presentation') ||
           resource.resource_type?.toLowerCase().includes('slide'))
        ? 'presentation'
        : 'pdf'

      return {
        id: resource.id,
        title: resource.title,
        description: resource.description,
        type,
        category: resource.category || 'Uncategorized',
        fileUrl: resource.file_url,
        fileSize: 'N/A', // Would need storage metadata for actual size
        downloads: downloadCounts[resource.id] || 0,
        uploadedAt: resource.created_at,
        certificationLevel: resource.certification_level,
      }
    }) || []

    // Calculate stats
    const totalResources = formattedResources.length
    const totalDownloads = Object.values(downloadCounts).reduce((sum, count) => sum + count, 0)
    const uniqueCategories = categories.length

    const stats = {
      totalResources,
      totalDownloads,
      categories: uniqueCategories,
      storageUsed: 'N/A', // Would need storage API for actual usage
    }

    return successResponse({
      resources: formattedResources,
      stats,
      categories,
    })
  } catch (error) {
    logger.error('Error in admin resources route:', error as Error)
    return successResponse({ resources: [], stats: getDefaultStats(), categories: [] })
  }
})

function getDefaultStats() {
  return {
    totalResources: 0,
    totalDownloads: 0,
    categories: 0,
    storageUsed: 'N/A',
  }
}
