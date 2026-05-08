import { getPlatformStats, getRecentActivity } from '@/lib/actions/superadmin'
import SuperAdminDashboardWorkspace from '@/components/features/superadmin/SuperAdminDashboardWorkspace'

export const dynamic = 'force-dynamic'

export default async function SuperAdminDashboardPage() {
  // Fetch fresh 100% database-backed stats on server startup
  const initialStats = await getPlatformStats()
  const initialActivities = await getRecentActivity()

  return (
    <div className="space-y-6">
      <SuperAdminDashboardWorkspace 
        initialStats={initialStats} 
        initialActivities={initialActivities} 
      />
    </div>
  )
}
