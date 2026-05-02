'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent
} from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TicketCard, type TicketCardData } from './TicketCard'
import type { TicketStatus } from '@/types/database'
import { updateTicketStatus } from '@/lib/actions/tickets'
import { toast } from 'sonner'

interface KanbanBoardProps {
  initialTickets: TicketCardData[]
}

const COLUMNS: { id: TicketStatus; title: string }[] = [
  { id: 'intake', title: 'Intake' },
  { id: 'diagnosing', title: 'Diagnosing' },
  { id: 'waiting_parts', title: 'Waiting Parts' },
  { id: 'repairing', title: 'Repairing' },
  { id: 'ready', title: 'Ready for Pickup' },
]

export function KanbanBoard({ initialTickets }: KanbanBoardProps) {
  const [tickets, setTickets] = useState(initialTickets)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Optimistic UI update
  const [optimisticTickets, addOptimisticUpdate] = useOptimistic(
    tickets,
    (state, update: { id: string; status: TicketStatus }) => {
      return state.map(t => t.id === update.id ? { ...t, status: update.status } : t)
    }
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveTask = active.data.current?.type === 'Ticket'
    const isOverTask = over.data.current?.type === 'Ticket'
    const isOverColumn = over.data.current?.type === 'Column'

    if (!isActiveTask) return

    setTickets(tickets => {
      const activeIndex = tickets.findIndex(t => t.id === activeId)
      const overIndex = tickets.findIndex(t => t.id === overId)

      if (isOverTask && tickets[activeIndex].status !== tickets[overIndex].status) {
        const newTickets = [...tickets]
        newTickets[activeIndex].status = tickets[overIndex].status
        return arrayMove(newTickets, activeIndex, overIndex)
      }

      if (isOverColumn) {
        const newTickets = [...tickets]
        newTickets[activeIndex].status = overId as TicketStatus
        return arrayMove(newTickets, activeIndex, newTickets.length - 1)
      }

      return tickets
    })
  }

  const onDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const ticketId = active.id as string
    const targetStatus = (over.data.current?.type === 'Column' 
      ? over.id 
      : over.data.current?.ticket?.status) as TicketStatus | undefined

    const originalTicket = initialTickets.find(t => t.id === ticketId)

    if (targetStatus && originalTicket && originalTicket.status !== targetStatus) {
      // Optimistic visual update
      startTransition(() => {
        addOptimisticUpdate({ id: ticketId, status: targetStatus })
      })

      // Server action
      updateTicketStatus(ticketId, targetStatus).catch((e) => {
        toast.error('Failed to update status: ' + e.message)
        // Revert on failure
        setTickets(initialTickets)
      })
    } else {
      // Just reordering within the same column
      const activeIndex = tickets.findIndex(t => t.id === ticketId)
      const overIndex = tickets.findIndex(t => t.id === over.id)
      if (activeIndex !== overIndex) {
        setTickets(arrayMove(tickets, activeIndex, overIndex))
      }
    }
  }

  const activeTicket = activeId ? tickets.find(t => t.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-180px)]">
        {COLUMNS.map(col => {
          const columnTickets = optimisticTickets.filter(t => t.status === col.id)
          return (
            <div key={col.id} className="flex flex-col flex-shrink-0 w-80 bg-muted/40 rounded-2xl border border-border">
              <div className="p-4 border-b border-border flex justify-between items-center bg-card rounded-t-2xl">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full status-${col.id} border-none bg-current`} />
                  {col.title}
                </h3>
                <span className="text-xs font-medium text-muted-foreground bg-accent px-2 py-0.5 rounded-full">
                  {columnTickets.length}
                </span>
              </div>
              
              <div className="flex-1 p-3 overflow-y-auto space-y-3">
                <SortableContext items={columnTickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  {columnTickets.map(ticket => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                  ))}
                  {columnTickets.length === 0 && (
                    <div className="h-full min-h-[100px] rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-sm font-medium">
                      Drop here
                    </div>
                  )}
                </SortableContext>
              </div>
            </div>
          )
        })}
      </div>

      <DragOverlay>
        {activeTicket ? <TicketCard ticket={activeTicket} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
