'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckSquare, Square, Plus, Trash2, Save } from 'lucide-react'
import { toast } from 'sonner'

interface ChecklistItem {
  id: string
  label: string
  completed: boolean
}

interface RepairChecklistProps {
  ticketId: string
  initialChecklist: ChecklistItem[]
}

export function RepairChecklist({ ticketId, initialChecklist }: RepairChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>(initialChecklist)
  const [newItemLabel, setNewItemLabel] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const saveChecklist = async (updatedItems: ChecklistItem[]) => {
    setSaving(true)
    try {
      // Get current metadata first to avoid overwriting other fields
      const { data: ticket } = await supabase
        .from('repair_tickets')
        .select('metadata')
        .eq('id', ticketId)
        .single()

      const currentMetadata = (ticket?.metadata as any) || {}
      
      const { error } = await supabase
        .from('repair_tickets')
        .update({
          metadata: {
            ...currentMetadata,
            repair_checklist: updatedItems
          }
        })
        .eq('id', ticketId)

      if (error) throw error
    } catch (err: any) {
      toast.error('Failed to save checklist: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleItem = (id: string) => {
    const updated = items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    )
    setItems(updated)
    saveChecklist(updated)
  }

  const addItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemLabel.trim()) return
    
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      label: newItemLabel.trim(),
      completed: false
    }
    
    const updated = [...items, newItem]
    setItems(updated)
    setNewItemLabel('')
    saveChecklist(updated)
  }

  const removeItem = (id: string) => {
    const updated = items.filter(item => item.id !== id)
    setItems(updated)
    saveChecklist(updated)
  }

  return (
    <div className="bg-white dark:bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <CheckSquare className="w-5 h-5 text-brand-500" />
          <h2 className="text-xs font-black text-foreground uppercase tracking-widest">Repair Checklist</h2>
        </div>
        {saving && <span className="text-[10px] font-bold text-brand-500 animate-pulse uppercase">Saving...</span>}
      </div>
      
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 group">
              <button 
                onClick={() => toggleItem(item.id)}
                className={`transition-colors ${item.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-400'}`}
              >
                {item.completed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
              </button>
              <span className={`text-sm font-medium flex-1 ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                {item.label}
              </span>
              <button 
                onClick={() => removeItem(item.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-xs text-slate-400 italic text-center py-4">No checklist items yet.</p>
          )}
        </div>

        <form onSubmit={addItem} className="flex gap-2 pt-2 border-t border-border border-dashed">
          <input 
            type="text" 
            value={newItemLabel}
            onChange={(e) => setNewItemLabel(e.target.value)}
            placeholder="Add a task (e.g., Test FaceID)..."
            className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <button 
            type="submit"
            className="p-1.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
