'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteEmployee } from '@/lib/actions/hr'
import { toast } from 'sonner'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'

interface DeleteEmployeeButtonProps {
  employeeId: string
  shopId: string
  employeeName: string
}

export function DeleteEmployeeButton({ employeeId, shopId, employeeName }: DeleteEmployeeButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteEmployee(employeeId, shopId)
        toast.success(`${employeeName} has been removed.`)
        router.push('/dashboard/staff')
      } catch (err: any) {
        toast.error(err.message)
        setShowConfirm(false)
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/15 text-sm font-semibold transition-all"
      >
        <Trash2 className="w-4 h-4" />
        Remove
      </button>

      {showConfirm && (
        <>
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={() => !isPending && setShowConfirm(false)} />
          <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-sm translate-x-[-50%] translate-y-[-50%] bg-background border border-border rounded-3xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Remove Employee?</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  This will permanently delete <span className="font-bold text-foreground">{employeeName}</span> and all their attendance records. This cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={isPending}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {isPending ? 'Removing...' : 'Yes, Remove'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
