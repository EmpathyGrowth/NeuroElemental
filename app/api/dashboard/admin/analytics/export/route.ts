/**
 * Admin Analytics Export API Route
 * Export analytics data as CSV
 */

import { createAdminRoute } from '@/lib/api'
import { getSupabaseServer } from '@/lib/db'
import { logger } from '@/lib/logging'
import { subDays, format } from 'date-fns'
import { NextResponse } from 'next/server'

/**
 * GET /api/dashboard/admin/analytics/export
 * Export analytics data as CSV (admin only)
 */
export const GET = createAdminRoute(async (request) => {
  const supabase = getSupabaseServer()
  const { searchParams } = new URL(request.url)
  const daysParam = searchParams.get('days') || '30'
  const days = Math.min(Math.max(parseInt(daysParam, 10) || 30, 7), 365)
  const exportType = searchParams.get('type') || 'overview'

  const now = new Date()
  const startDate = subDays(now, days)

  let csvContent = ''
  let filename = `analytics-${exportType}-${format(now, 'yyyy-MM-dd')}.csv`

  try {
    switch (exportType) {
      case 'users': {
        // Export user data
        const { data: users } = await supabase
          .from('profiles')
          .select('id, email, full_name, role, created_at')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false })

        csvContent = 'ID,Email,Name,Role,Created At\n'
        users?.forEach(user => {
          csvContent += `"${user.id}","${user.email || ''}","${user.full_name || ''}","${user.role || ''}","${user.created_at}"\n`
        })
        filename = `users-export-${format(now, 'yyyy-MM-dd')}.csv`
        break
      }

      case 'revenue': {
        // Export revenue data
        const { data: transactions } = await supabase
          .from('credit_transactions')
          .select('id, user_id, amount, transaction_type, metadata, created_at')
          .eq('transaction_type', 'add')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false })

        csvContent = 'ID,User ID,Amount (cents),Type,Category,Created At\n'
        transactions?.forEach(tx => {
          const metadata = tx.metadata as { price?: number; category?: string } | null
          const price = metadata?.price || 0
          const category = metadata?.category || 'unknown'
          csvContent += `"${tx.id}","${tx.user_id}","${price}","${tx.transaction_type}","${category}","${tx.created_at}"\n`
        })
        filename = `revenue-export-${format(now, 'yyyy-MM-dd')}.csv`
        break
      }

      case 'courses': {
        // Export course enrollment data
        interface EnrollmentExport {
          id: string;
          user_id: string | null;
          course_id: string | null;
          payment_status: string | null;
          enrolled_at: string | null;
          completed_at: string | null;
          course: { title?: string } | null;
        }
        const { data: enrollments } = await supabase
          .from('course_enrollments')
          .select(`
            id,
            user_id,
            course_id,
            payment_status,
            enrolled_at,
            completed_at,
            course:courses(title)
          `)
          .gte('enrolled_at', startDate.toISOString())
          .order('enrolled_at', { ascending: false }) as { data: EnrollmentExport[] | null; error: unknown }

        csvContent = 'ID,User ID,Course ID,Course Title,Payment Status,Enrolled At,Completed At\n'
        enrollments?.forEach(enrollment => {
          const courseTitle = enrollment.course?.title || 'Unknown'
          csvContent += `"${enrollment.id}","${enrollment.user_id}","${enrollment.course_id}","${courseTitle}","${enrollment.payment_status || ''}","${enrollment.enrolled_at}","${enrollment.completed_at || ''}"\n`
        })
        filename = `course-enrollments-export-${format(now, 'yyyy-MM-dd')}.csv`
        break
      }

      case 'events': {
        // Export event registration data
        // Note: Using type assertion because event_registrations schema may not be fully typed
        const { data: registrations } = await supabase
          .from('event_registrations')
          .select('id, user_id, event_id, created_at')
          .order('created_at', { ascending: false }) as { data: Array<{ id: string; user_id: string; event_id: string; created_at: string }> | null; error: unknown }

        // Get event titles separately
        const eventIds = [...new Set(registrations?.map(r => r.event_id) || [])]
        const { data: events } = await supabase
          .from('events')
          .select('id, title')
          .in('id', eventIds) as { data: Array<{ id: string; title: string }> | null; error: unknown }

        const eventMap = new Map(events?.map(e => [e.id, e]) || [])

        csvContent = 'ID,User ID,Event ID,Event Title,Registered At\n'
        registrations?.forEach(reg => {
          const event = eventMap.get(reg.event_id)
          csvContent += `"${reg.id}","${reg.user_id}","${reg.event_id}","${event?.title || 'Unknown'}","${reg.created_at}"\n`
        })
        filename = `event-registrations-export-${format(now, 'yyyy-MM-dd')}.csv`
        break
      }

      default: {
        // Export overview summary
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })

        const { count: newUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString())

        const { count: totalCourses } = await supabase
          .from('courses')
          .select('*', { count: 'exact', head: true })

        const { count: totalEnrollments } = await supabase
          .from('course_enrollments')
          .select('*', { count: 'exact', head: true })

        const { count: newEnrollments } = await supabase
          .from('course_enrollments')
          .select('*', { count: 'exact', head: true })
          .gte('enrolled_at', startDate.toISOString())

        const { count: totalEvents } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })

        const { data: transactions } = await supabase
          .from('credit_transactions')
          .select('metadata')
          .eq('transaction_type', 'add')

        const totalRevenue = transactions?.reduce((sum, t) => {
          const price = (t.metadata as { price?: number })?.price || 0
          return sum + price
        }, 0) || 0

        csvContent = 'Metric,Value,Period\n'
        csvContent += `"Total Users","${totalUsers || 0}","All Time"\n`
        csvContent += `"New Users","${newUsers || 0}","Last ${days} days"\n`
        csvContent += `"Total Courses","${totalCourses || 0}","All Time"\n`
        csvContent += `"Total Enrollments","${totalEnrollments || 0}","All Time"\n`
        csvContent += `"New Enrollments","${newEnrollments || 0}","Last ${days} days"\n`
        csvContent += `"Total Events","${totalEvents || 0}","All Time"\n`
        csvContent += `"Total Revenue (cents)","${totalRevenue}","All Time"\n`
        csvContent += `"Export Date","${format(now, 'yyyy-MM-dd HH:mm:ss')}",""\n`
        filename = `analytics-overview-${format(now, 'yyyy-MM-dd')}.csv`
        break
      }
    }

    // Return CSV file response
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    logger.error('Error exporting analytics:', error as Error)
    return new NextResponse('Export failed', { status: 500 })
  }
})
