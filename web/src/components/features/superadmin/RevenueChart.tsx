'use client'

import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts'

interface RevenueChartProps {
  data: { name: string; revenue: number }[]
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="bg-slate-50/90 border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm backdrop-blur-md">
      <h3 className="text-sm font-black text-slate-700 uppercase tracking-[0.2em] mb-8">SaaS Revenue (6 Months)</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorBilling" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#475569" 
              fontSize={10} 
              fontWeight="bold"
              tickLine={false} 
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#475569" 
              fontSize={10} 
              fontWeight="bold"
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `LKR ${value / 1000}k`}
              dx={-10}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '1rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}
              itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
              labelStyle={{ color: '#475569', fontWeight: 'bold' }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorBilling)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
