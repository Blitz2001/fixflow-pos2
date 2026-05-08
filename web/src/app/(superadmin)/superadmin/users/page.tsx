import { 
  Search, Filter, UserPlus
} from 'lucide-react'
import { getAllUsers } from '@/lib/actions/superadmin'
import { Suspense } from 'react'
import UserManagementInterface from './UserManagementInterface'

async function UserList() {
  const users = await getAllUsers()
  return <UserManagementInterface users={users} />
}

export default function UserDatabasePage() {
  return (
    <div className="space-y-6 animate-fade-in pb-20 pt-4">
      {/* Sleek Command Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex-1 max-w-xl">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Filter platform profiles..." 
            className="bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400 w-full font-medium"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
          <button className="px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2">
            <UserPlus className="w-3.5 h-3.5" />
            Add User
          </button>
        </div>
      </div>

      <Suspense fallback={
        <div className="space-y-8 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-white border border-slate-100 rounded-3xl shadow-sm" />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-white border border-slate-100 rounded-3xl shadow-sm" />
            ))}
          </div>
        </div>
      }>
        <UserList />
      </Suspense>
    </div>
  )
}
