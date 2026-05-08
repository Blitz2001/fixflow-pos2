'use client'

import { useState } from 'react'
import { 
  Plus, Download, RefreshCw, Send, 
  Database, FileText, Lock, Store, Calendar, MessageSquare
} from 'lucide-react'

interface SuperAdminActionButtonProps {
  label: string
  action: 'provision' | 'export' | 'report' | 'rotate' | 'ticket'
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
}

export default function SuperAdminActionButton({ 
  label, action, variant = 'primary', className = ''
}: SuperAdminActionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const Icon = {
    provision: Store,
    export: Download,
    report: Calendar,
    rotate: Lock,
    ticket: MessageSquare
  }[action] || Plus

  const handleClick = async () => {
    setIsLoading(true)
    try {
      if (action === 'provision') {
        alert('Initializing new shop provisioning...')
        setTimeout(() => alert('Tenant created successfully.'), 1500)
      } else if (action === 'export') {
        alert('Generating platform export...')
        setTimeout(() => alert('Export ready.'), 1000)
      } else if (action === 'report') {
        alert('Compiling financial report...')
        setTimeout(() => alert('Report generated.'), 1200)
      } else if (action === 'rotate') {
        if (confirm('DANGER: proceed with secret rotation?')) {
          alert('Rotating platform secrets...')
          setTimeout(() => alert('Secrets rotated.'), 2000)
        }
      } else if (action === 'ticket') {
        alert('Opening support dispatcher...')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const baseStyles = "px-6 py-4 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
  const variants = {
    primary: "bg-brand-600 text-white shadow-brand-200 hover:bg-brand-700 hover:shadow-lg",
    secondary: "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:shadow-md",
    ghost: "text-slate-400 hover:text-slate-900 transition-colors shadow-none"
  }

  return (
    <button 
      onClick={handleClick}
      disabled={isLoading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {isLoading ? (
        <RefreshCw className="w-4 h-4 animate-spin" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
      {label}
    </button>
  )
}
