import { 
  Users, UserCheck, Shield, 
  Mail, Store, Calendar, 
  ArrowUpRight 
} from 'lucide-react'
import { getAllUsers } from '@/lib/actions/superadmin'
import { Suspense } from 'react'

async function UserList() {
  const users = await getAllUsers()

  if (!users.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Users className="w-12 h-12 text-white/10 mb-4" />
        <p className="text-white/40">No users found in the system.</p>
      </div>
    )
  }

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/[0.06]">
              <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest">User Profile</th>
              <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest">Assigned Shops</th>
              <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest">Primary Role</th>
              <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest">Joined</th>
              <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/[0.01] transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-white/10 flex items-center justify-center shrink-0">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <Users className="w-4 h-4 text-white/40" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{user.full_name || 'Incomplete Profile'}</p>
                      <p className="text-xs text-white/40 truncate">{user.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-1.5">
                    {user.memberships.length > 0 ? (
                      user.memberships.map((m: any) => (
                        <div key={m.id} className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-white/60">
                          {m.shop.name}
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] text-white/20">No shop assigned</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  {user.memberships.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3 text-violet-400" />
                      <span className="text-xs font-bold text-white/70">{user.memberships[0].role}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-white/20">—</span>
                  )}
                </td>
                <td className="px-6 py-5">
                  <span className="text-xs text-white/40">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="text-[10px] font-black text-violet-400 uppercase tracking-widest hover:text-white transition-colors">
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function UsersManagementPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-white tracking-tight">User Directory</h1>
        <p className="text-white/40 text-sm">View and manage all registered shop owners and staff across the platform.</p>
      </div>

      <Suspense fallback={<div className="py-20 flex justify-center"><UserCheck className="w-10 h-10 text-violet-500 animate-spin opacity-20" /></div>}>
        <UserList />
      </Suspense>
    </div>
  )
}
