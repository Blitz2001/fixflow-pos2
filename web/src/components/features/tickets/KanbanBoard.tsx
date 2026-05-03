'use client'

import { useState, useTransition, useOptimistic, useRef } from 'react'
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
  DragEndEvent,
  useDroppable
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
  { id: 'intake',        title: 'RECEIVED' },
  { id: 'diagnosing',    title: 'REPAIR STARTED' },
  { id: 'waiting_parts', title: 'REPAIR DELAYED' },
  { id: 'ready',         title: 'REPAIR FINISHED &\nREADY TO SEND' },
  { id: 'cancelled',     title: "CAN'T REPAIR" },
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

  // Mouse Drag to Scroll Logic
  const [isDraggingScroll, setIsDraggingScroll] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag if clicking the background, a column, or a header
    // But NOT if clicking a ticket (handled by DnD-kit)
    if (e.button !== 0) return
    
    const target = e.target as HTMLElement
    // Prevent scrolling if clicking interactive elements inside cards
    if (target.closest('.ticket-card')) return
    if (target.tagName === 'BUTTON' || target.tagName === 'A') return

    setIsDraggingScroll(true)
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0))
    setScrollLeft(scrollRef.current?.scrollLeft || 0)
  }

  const handleMouseLeave = () => setIsDraggingScroll(false)
  const handleMouseUp = () => setIsDraggingScroll(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingScroll || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - (scrollRef.current.offsetLeft || 0)
    const walk = (x - startX) * 2 // Speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  const activeTicket = activeId ? optimisticTickets.find(t => t.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className={`scroll-container flex gap-4 overflow-x-auto h-full select-none transition-shadow [&::-webkit-scrollbar]:hidden ${
          isDraggingScroll ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {COLUMNS.map(col => (
          <KanbanColumn 
            key={col.id} 
            column={col} 
            tickets={optimisticTickets.filter(t => t.status === col.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTicket ? <TicketCard ticket={activeTicket} /> : null}
      </DragOverlay>
    </DndContext>
  )
}

function KanbanColumn({ column, tickets }: { column: { id: TicketStatus; title: string }; tickets: TicketCardData[] }) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  })

  return (
    <div 
      ref={setNodeRef}
      className="flex flex-col flex-shrink-0 w-72 bg-muted/30 rounded-3xl border border-border/50"
    >
      <div className="p-4 border-b border-border flex justify-between items-center bg-white dark:bg-card rounded-t-3xl shadow-sm">
        <h3 className="text-xs font-black text-foreground flex items-center gap-2 tracking-tight whitespace-pre-line leading-tight py-1">
          <div className={`w-2.5 h-2.5 rounded-full status-${column.id} border-none bg-current shadow-sm shrink-0`} />
          {column.title}
        </h3>
        <span className="text-[11px] font-black text-brand-500 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
          {tickets.length}
        </span>
      </div>
      
      <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
        <SortableContext items={tickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tickets.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
          {tickets.length === 0 && (
            <div className="h-full min-h-[200px] rounded-2xl border-2 border-dashed border-border/40 flex items-center justify-center text-muted-foreground/50 text-sm font-black uppercase tracking-widest bg-muted/5">
              Drop items here
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
}
