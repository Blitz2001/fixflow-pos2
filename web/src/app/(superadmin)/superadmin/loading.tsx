import React from 'react'

export default function SuperAdminLoading() {
  return (
    <div className="space-y-8 animate-pulse pb-20 pt-4">
      {/* Skeleton Header Bar */}
      <div className="h-12 bg-slate-200/50 border border-slate-200/60 rounded-2xl w-full"></div>

      {/* Skeleton KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-44 bg-slate-200/50 border border-slate-200/60 rounded-3xl w-full"></div>
        ))}
      </div>

      {/* Skeleton Operation Stream */}
      <div className="h-[520px] bg-slate-200/50 border border-slate-200/60 rounded-3xl w-full"></div>
    </div>
  )
}
