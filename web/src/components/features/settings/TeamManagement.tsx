'use client'

import { useState } from 'react'
import { UserPlus, Shield, Mail, Trash2, ShieldCheck, ShieldAlert, Wrench } from 'lucide-react'
import { toast } from 'sonner'
import { inviteTeamMember } from '@/lib/actions/shop'
import type { MemberWithProfile } from '@/types/database'

interface TeamManagementProps {
  shopId: string
  members: MemberWithProfile[]
  currentUserId: string
}

export function TeamManagement({ shopId, members, currentUserId }: TeamManagementProps) {
  const [isInviting, setIsInviting] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'TECHNICIAN'>('TECHNICIAN')

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await inviteTeamMember(shopId, email, role)
      toast.success('Member added successfully')
      setEmail('')
      setIsInviting(false)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Team Members</h3>
        <button 
          onClick={() => setIsInviting(!isInviting)}
          className="flex items-center gap-2 text-sm bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl font-semibold transition-all"
        >
          <UserPlus className="w-4 h-4" /> {isInviting ? 'Cancel' : 'Add Member'}
        </button>
      </div>

      {isInviting && (
        <form onSubmit={handleInvite} className="bg-muted/30 border border-border p-5 rounded-2xl animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5 ml-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                required
                className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5 ml-1">Role</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
              >
                <option value="ADMIN">Admin (Full Access)</option>
                <option value="TECHNICIAN">Technician (Repairs Only)</option>
              </select>
            </div>
            <div className="flex items-end">
              <button 
                type="submit"
                className="w-full py-2.5 bg-foreground text-background font-bold rounded-xl text-sm hover:bg-foreground/90 transition-all"
              >
                Send Invite
              </button>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 italic">* User must have an existing account in RepairOS to be added currently.</p>
        </form>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase">Member</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase">Access</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {member.profile?.avatar_url ? (
                          <img src={member.profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          member.profile?.full_name?.[0] || '?'
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{member.profile?.full_name || 'Pending User'}</p>
                        <p className="text-xs text-muted-foreground">User ID: {member.user_id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      member.role === 'OWNER' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                      member.role === 'ADMIN' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {member.role === 'OWNER' && <ShieldCheck className="w-3 h-3" />}
                      {member.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                      {member.role === 'TECHNICIAN' && <Wrench className="w-3 h-3" />}
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={member.role !== 'TECHNICIAN'} 
                        disabled 
                        className="w-4 h-4 rounded border-border text-brand-500 focus:ring-brand-500 transition-all cursor-not-allowed"
                      />
                      <span className="text-xs text-muted-foreground font-medium">
                        {member.role === 'OWNER' ? 'Super Admin' : member.role === 'ADMIN' ? 'Full Access' : 'Repair Only'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {member.user_id !== currentUserId && member.role !== 'OWNER' && (
                      <button className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
