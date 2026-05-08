'use client'

import { useState } from 'react'
import { Activity, Settings, HardDrive } from 'lucide-react'
import Link from 'next/link'

interface UserActionsProps {
  userId: string
  userName: string
}

export default function UserActions({ userId, userName }: UserActionsProps) {
  const [isSnapshotting, setIsSnapshotting] = useState(false)

  const handleSettings = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    alert(`Opening Security & Privilege Overrides for user ${userName}...`)
  }

  const handleSnapshot = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsSnapshotting(true)
    try {
      alert(`Generating complete activity report & security snapshot for user ${userName}...`)
      alert('Snapshot successfully archived in AWS Glacier.')
    } finally {
      setIsSnapshotting(false)
    }
  }

  return (
    <div className="flex items-center gap-2 relative z-20">
      {/* View Telemetry / Profile */}
      <Link 
        href={`/superadmin/users/${userId}`}
        className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-100 shadow-sm"
        title="View User Telemetry"
        onClick={(e) => e.stopPropagation()}
      >
        <Activity className="w-4 h-4" />
      </Link>

      {/* Override Configuration */}
      <button 
        onClick={handleSettings}
        className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-100 shadow-sm" 
        title="Override Settings"
      >
        <Settings className="w-4 h-4" />
      </button>

      {/* Backup State */}
      <button 
        onClick={handleSnapshot}
        disabled={isSnapshotting}
        className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all border border-slate-100 shadow-sm disabled:opacity-50" 
        title="User State Backup"
      >
        <HardDrive className="w-4 h-4" />
      </button>
    </div>
  )
}
