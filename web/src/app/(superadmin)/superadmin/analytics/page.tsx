import { 
  BarChart3, TrendingUp, Users, ShoppingCart, 
  Download, Filter, Calendar, ArrowUpRight,
  Target, Zap, Activity
} from 'lucide-react'
import { getAnalyticsData } from '@/lib/actions/superadmin'
import AnalyticsCharts from '@/components/features/superadmin/AnalyticsCharts'

export default async function AnalyticsPage() {
  const data = await getAnalyticsData()
  const { revenueChart, growthChart, stats } = data

  return (
    <div className="space-y-12 animate-fade-in pb-20 pt-10">
      {/* Search & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
        <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex-1 max-w-xl">
          <Calendar className="w-5 h-5 text-slate-400" />
          <span className="text-base font-semibold text-slate-900">Current Quarter: Q2 2026</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 text-sm font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Dataset
          </button>
          <button className="px-6 py-4 rounded-2xl bg-brand-600 text-white text-sm font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Adjust Range
          </button>
        </div>
      </div>

      {/* Advanced KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <ShoppingCart className="w-7 h-7 text-blue-600" />
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-sm font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>+5.2%</span>
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Avg. Order Value (AOV)</p>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">LKR {stats.avgOrderValue.toLocaleString()}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <Target className="w-7 h-7 text-emerald-600" />
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-sm font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>+12.8%</span>
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Customer Lifetime Value</p>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">LKR {stats.customerLifetimeValue.toLocaleString()}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
              <Activity className="w-7 h-7 text-rose-600" />
            </div>
            <div className="flex items-center gap-1 text-rose-600 text-sm font-bold">
              <TrendingUp className="w-4 h-4 rotate-180" />
              <span>-0.4%</span>
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Platform Churn Rate</p>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">{stats.churnRate}%</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
        <AnalyticsCharts revenueData={revenueChart} growthData={growthChart} />
      </div>

      {/* Reports Table */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Performance Audit</h2>
          <button className="text-sm font-bold text-brand-600 hover:text-brand-700 transition-all flex items-center gap-2">
            View Historical Data <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Period</th>
                <th className="pb-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Revenue</th>
                <th className="pb-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Orders</th>
                <th className="pb-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Growth</th>
                <th className="pb-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">AOV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...Array(6)].map((_, i) => (
                <tr key={i} className="group hover:bg-slate-50 transition-all">
                  <td className="py-5 font-semibold text-slate-900">May {2026 - i}</td>
                  <td className="py-5 text-right font-bold text-slate-900">LKR {(1200000 - i * 50000).toLocaleString()}</td>
                  <td className="py-5 text-right font-medium text-slate-600">{450 - i * 15}</td>
                  <td className="py-5 text-right">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-100">+{(12.5 - i * 0.5).toFixed(1)}%</span>
                  </td>
                  <td className="py-5 text-right font-bold text-slate-900">LKR 2,450</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
