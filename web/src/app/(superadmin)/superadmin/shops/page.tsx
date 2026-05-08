import { getShopsWithPulse } from '@/lib/actions/superadmin-ops'
import ShopNetworkInterface from './ShopNetworkInterface'
import { Suspense } from 'react'

export default async function ShopsManagementPage() {
  const shops = await getShopsWithPulse()

  return (
    <Suspense fallback={
      <div className="space-y-10 pt-10 animate-pulse">
        <div className="flex justify-between gap-6 mb-4">
          <div className="h-16 bg-white border border-slate-200 rounded-3xl flex-1 max-w-xl" />
          <div className="flex gap-3">
            <div className="h-16 w-32 bg-white border border-slate-200 rounded-2xl" />
            <div className="h-16 w-48 bg-slate-100 rounded-2xl" />
          </div>
        </div>
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-40 bg-white border border-slate-200 rounded-[2rem] shadow-sm" />
          ))}
        </div>
      </div>
    }>
      <ShopNetworkInterface initialShops={shops} />
    </Suspense>
  )
}
