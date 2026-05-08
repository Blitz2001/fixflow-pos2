'use client'

import { 
  Settings, ShieldCheck, Stethoscope, Database, 
  HardDrive, ClipboardList, ShieldAlert, Palette, Languages, 
  Package, DollarSign, CircleDollarSign, Bell, ArrowRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const SETTINGS_MODULES = [
  {
    category: 'Security & Access',
    items: [
      { title: 'Security Center', desc: 'Manage 2FA, IP whitelists, and firewalls', icon: ShieldCheck, href: '/superadmin/security', color: 'emerald' },
      { title: 'Role & Permissions', desc: 'Configure Super Admin and Staff RBAC', icon: ShieldAlert, href: '/superadmin/roles', color: 'rose' },
      { title: 'Audit Logs', desc: 'Track every action taken on the platform', icon: ClipboardList, href: '/superadmin/logs', color: 'amber' },
    ]
  },
  {
    category: 'Infrastructure',
    items: [
      { title: 'System Health', desc: 'Live CPU, RAM, and Database monitoring', icon: Stethoscope, href: '/superadmin/health', color: 'blue' },
      { title: 'Storage & DB', desc: 'Manage tenant database sizes and limits', icon: Database, href: '/superadmin/storage', color: 'violet' },
      { title: 'Backup & Recovery', desc: 'Automated snapshots and recovery', icon: HardDrive, href: '/superadmin/backups', color: 'brand' },
    ]
  },
  {
    category: 'Monetization & Plans',
    items: [
      { title: 'Plan Management', desc: 'Create and edit SaaS subscription tiers', icon: Package, href: '/superadmin/packages', color: 'fuchsia' },
      { title: 'Payment Gateways', desc: 'Stripe, PayPal, and PayHere config', icon: DollarSign, href: '/superadmin/gateways', color: 'emerald' },
      { title: 'Revenue Control', desc: 'Advanced churn and MRR deep-dive', icon: CircleDollarSign, href: '/superadmin/revenue', color: 'amber' },
    ]
  },
  {
    category: 'Customization',
    items: [
      { title: 'Branding System', desc: 'White-labeling, logos, and invoices', icon: Palette, href: '/superadmin/branding', color: 'rose' },
      { title: 'Languages', desc: 'Manage translations (EN, SI, TA)', icon: Languages, href: '/superadmin/languages', color: 'blue' },
      { title: 'Global Notifications', desc: 'System-wide alerts and templates', icon: Bell, href: '/superadmin/notifications', color: 'violet' },
    ]
  }
]

export default function PlatformSettingsPage() {
  const router = useRouter()

  return (
    <div className="space-y-12 animate-fade-in pb-20 pt-4">
      <div className="space-y-10">
        {SETTINGS_MODULES.map((group, idx) => (
          <div key={idx} className="space-y-4">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">{group.category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {group.items.map((item, i) => {
                const Icon = item.icon
                const colorMap = {
                  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                  rose: 'bg-rose-50 text-rose-600 border-rose-100',
                  amber: 'bg-amber-50 text-amber-600 border-amber-100',
                  blue: 'bg-blue-50 text-blue-600 border-blue-100',
                  violet: 'bg-violet-50 text-violet-600 border-violet-100',
                  brand: 'bg-blue-50 text-blue-600 border-blue-100',
                  fuchsia: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100',
                }
                const colorClass = colorMap[item.color as keyof typeof colorMap] || colorMap.brand

                return (
                  <div 
                    key={i}
                    onClick={() => router.push(item.href)}
                    className="group bg-white border border-slate-200 hover:border-brand-200 hover:shadow-lg rounded-2xl p-5 transition-all duration-300 flex flex-col shadow-sm cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl ${colorClass} border flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 duration-500`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight mb-1">{item.title}</h3>
                    <p className="text-[11px] text-slate-400 font-bold leading-relaxed">{item.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

