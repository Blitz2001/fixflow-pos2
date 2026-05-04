import { 
  Store, MoreVertical, ShieldCheck, ShieldAlert, 
  Trash2, ExternalLink, Calendar, Users, 
  Activity, Database 
} from 'lucide-react'
import { getShopsOverview, toggleShopLock, deleteShop } from '@/lib/actions/superadmin'
import { Suspense } from 'react'
import Link from 'next/link'

async function ShopList() {
  const shops = await getShopsOverview()

  if (!shops.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Store className="w-12 h-12 text-white/10 mb-4" />
        <p className="text-white/40">No shops registered on the platform yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {shops.map((shop) => (
        <div 
          key={shop.id} 
          className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 flex flex-col lg:flex-row lg:items-center gap-6 hover:border-white/10 transition-all group"
        >
          {/* Shop Identity */}
          <div className="flex items-center gap-4 lg:w-1/4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-white/10 flex items-center justify-center shrink-0">
              {shop.logo_url ? (
                <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <Store className="w-6 h-6 text-white/40" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-white truncate">{shop.name}</h3>
              <p className="text-xs text-white/40 truncate">{shop.address || 'No address'}</p>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Revenue</p>
              <p className="text-sm font-bold text-white">LKR {shop.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Active Tickets</p>
              <p className="text-sm font-bold text-white">{shop.activeTickets} / {shop.totalTickets}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Users</p>
              <p className="text-sm font-bold text-white">{shop.memberCount} Staff</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Database</p>
              <p className="text-sm font-bold text-emerald-400">{shop.totalRows} Rows</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 lg:w-1/4 justify-end">
            <Link 
              href={`/superadmin/shops/${shop.id}`}
              className="p-2.5 rounded-xl bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/10 transition-all border border-white/10"
              title="View Analytics"
            >
              <Activity className="w-4 h-4" />
            </Link>
            
            <form action={async () => {
              'use server'
              // Note: toggleShopLock currently uses tax_enabled as a dummy lock field for demonstration
              // In a real app, you'd add an is_locked column
              await toggleShopLock(shop.id, !shop.tax_enabled)
            }}>
              <button 
                type="submit"
                className={`p-2.5 rounded-xl border transition-all ${
                  shop.tax_enabled 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                }`}
                title={shop.tax_enabled ? "Unlocked" : "Locked"}
              >
                {shop.tax_enabled ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
              </button>
            </form>

            <form action={async () => {
              'use server'
              if (confirm('Are you sure you want to delete this shop? This cannot be undone.')) {
                await deleteShop(shop.id)
              }
            }}>
              <button 
                type="submit"
                className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
                title="Delete Shop"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ShopsManagementPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">Shop Management</h1>
          <p className="text-white/40 text-sm">Monitor and control all registered shops on the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white/60 text-sm font-medium">
            Total Shops: <span className="text-white font-bold ml-1">...</span>
          </div>
        </div>
      </div>

      <Suspense fallback={
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-white/[0.03] border border-white/[0.06] rounded-3xl animate-pulse" />
          ))}
        </div>
      }>
        <ShopList />
      </Suspense>
    </div>
  )
}
