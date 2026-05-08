'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  MessageSquare, AlertTriangle, CheckCircle2, 
  Clock, Search, Send, Store, ArrowUpRight, HelpCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { sendSupportMessage } from '@/lib/actions/support'
import { toast } from 'sonner'

interface TicketItem {
  id: string
  shopId: string
  shop: string
  subject: string
  status: string
  priority: string
  date: string
  messages: any[]
  updated_at: string
}

interface WorkspaceProps {
  initialTickets: TicketItem[]
}

export default function SuperAdminTicketsWorkspace({ initialTickets }: WorkspaceProps) {
  const [tickets, setTickets] = useState<TicketItem[]>(initialTickets)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    initialTickets.length > 0 ? initialTickets[0].id : null
  )
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')

  const chatEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // 1. Live Background Polling (Every 2 seconds for flawless synchronization)
  useEffect(() => {
    let active = true

    async function pollTickets() {
      try {
        const { data: raw, error } = await supabase
          .from('repair_tickets')
          .select('*, shop:shops(name)')
          .eq('priority', 'urgent')
          .order('updated_at', { ascending: false })

        if (error) throw error

        if (active && raw) {
          const parsed: TicketItem[] = raw.map(t => {
            const meta = typeof t.metadata === 'string' ? JSON.parse(t.metadata) : (t.metadata || {})
            return {
              id: t.id,
              shopId: t.shop_id,
              shop: (t.shop as any)?.name || 'Unknown',
              subject: t.issue_description,
              status: t.status === 'delivered' ? 'Closed' : 'Open',
              priority: 'Urgent',
              date: new Date(t.created_at).toLocaleDateString(),
              messages: Array.isArray(meta.messages) ? meta.messages : [],
              updated_at: t.updated_at
            }
          })
          setTickets(parsed)
        }
      } catch (err) {
        console.error('Polling tickets failed:', err)
      }
    }

    const interval = setInterval(pollTickets, 2000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  // 2. Scroll to bottom when selected ticket messages update
  const activeTicket = tickets.find(t => t.id === selectedTicketId)
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeTicket?.messages])

  // 3. Send Admin Reply
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || !selectedTicketId || sending) return

    const textToSend = input.trim()
    setInput('')
    setSending(true)

    // Optimistic local update
    const optimisticMsg = {
      sender: 'admin',
      text: textToSend,
      timestamp: new Date().toISOString()
    }

    setTickets(prev => prev.map(t => {
      if (t.id === selectedTicketId) {
        return { ...t, messages: [...t.messages, optimisticMsg] }
      }
      return t
    }))

    try {
      const updatedMessages = await sendSupportMessage(selectedTicketId, 'admin', textToSend)
      setTickets(prev => prev.map(t => {
        if (t.id === selectedTicketId) {
          return { ...t, messages: updatedMessages }
        }
        return t
      }))
    } catch (err) {
      toast.error('Failed to send admin reply')
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  // Filter list by search term
  const filteredTickets = tickets.filter(t => 
    t.shop.toLowerCase().includes(search.toLowerCase()) || 
    t.subject.toLowerCase().includes(search.toLowerCase())
  )

  const openTickets = tickets.filter(t => t.status === 'Open').length
  const urgentTickets = tickets.filter(t => t.priority === 'Urgent').length

  // Calculate dynamic Average Response Time based on actual conversation reply gaps
  let totalReplyGapMs = 0
  let replyCount = 0

  tickets.forEach(t => {
    const msgs = t.messages || []
    for (let i = 0; i < msgs.length - 1; i++) {
      const current = msgs[i]
      const next = msgs[i + 1]
      if (current.sender === 'shop' && next.sender === 'admin') {
        const gap = new Date(next.timestamp).getTime() - new Date(current.timestamp).getTime()
        if (gap > 0) {
          totalReplyGapMs += gap
          replyCount++
        }
      }
    }
  })

  const avgResponseStr = replyCount > 0 
    ? `${Math.round(totalReplyGapMs / replyCount / 1000 / 60)}m` 
    : '0m'

  // Calculate dynamic Resolved in the last 24h
  const oneDayAgo = new Date().getTime() - 24 * 60 * 60 * 1000
  const resolved24h = tickets.filter(t => 
    t.status === 'Closed' && 
    new Date(t.updated_at).getTime() >= oneDayAgo
  ).length

  return (
    <div className="space-y-6 animate-fade-in pb-20 pt-4">
      {/* Top Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Open Inboxes', value: openTickets, icon: MessageSquare, color: 'text-blue-500 bg-blue-50 border-blue-100' },
          { label: 'Urgent Priorities', value: urgentTickets, icon: AlertTriangle, color: 'text-rose-500 bg-rose-50 border-rose-100' },
          { label: 'Avg. Response', value: avgResponseStr, icon: Clock, color: 'text-amber-500 bg-amber-50 border-amber-100' },
          { label: 'Resolved (24h)', value: resolved24h, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-xl border ${stat.color}`}>
                <stat.icon className="w-3.5 h-3.5" />
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Support Center Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
        {/* Ticket List Panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col overflow-hidden h-full">
          <div className="mb-6 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase">Support Inboxes</h2>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{filteredTickets.length} active</span>
            </div>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Filter shop tickets..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-slate-700 placeholder:text-slate-400 w-full font-medium" 
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 custom-scrollbar">
            {filteredTickets.map((t) => {
              const lastMsg = t.messages[t.messages.length - 1]
              const active = t.id === selectedTicketId
              return (
                <div 
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                    active 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xl' 
                      : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-black">
                      <div className={`p-1.5 rounded-lg border ${active ? 'bg-white/10 border-white/20' : 'bg-slate-100 border-slate-200'}`}>
                        <Store className={`w-3 h-3 ${active ? 'text-white' : 'text-slate-400'}`} />
                      </div>
                      <span className="text-[11px] truncate max-w-[120px] uppercase tracking-tight">{t.shop}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                      active 
                        ? 'bg-white/20 text-white border border-white/20' 
                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <p className={`text-xs font-black tracking-tight truncate ${active ? 'text-white/90' : 'text-slate-900'}`}>
                    {t.subject}
                  </p>
                  <p className={`text-[10px] mt-2 truncate font-medium ${active ? 'text-white/60' : 'text-slate-400'}`}>
                    {lastMsg ? `${lastMsg.text}` : 'No messages yet'}
                  </p>
                </div>
              )
            })}

            {filteredTickets.length === 0 && (
              <div className="text-center py-20 flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">No shop escalations</p>
              </div>
            )}
          </div>
        </div>

        {/* Live Chat Messenger Panel */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden h-full">
          {activeTicket ? (
            <>
              {/* Active Chat Header */}
              <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-md shadow-slate-200">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">{activeTicket.shop}</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                      Session ID: {activeTicket.id.slice(0, 8).toUpperCase()} • Active Stream
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Operator Linked</span>
                </div>
              </div>

              {/* Messages Panel */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white">
                {activeTicket.messages.map((msg, i) => {
                  const isAdmin = msg.sender === 'admin'
                  return (
                    <div key={i} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                      <div className={`flex items-start gap-3 max-w-[80%] ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border text-[10px] font-black shadow-sm ${
                          isAdmin 
                            ? 'bg-slate-900 text-white border-slate-800' 
                            : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {isAdmin ? 'OP' : activeTicket.shop[0].toUpperCase()}
                        </div>

                        {/* Bubble */}
                        <div className="space-y-1">
                          <div className={`p-4 rounded-2xl shadow-sm text-xs font-bold leading-relaxed border ${
                            isAdmin 
                              ? 'bg-slate-900 text-white border-slate-800 rounded-tr-none' 
                              : 'bg-slate-50 text-slate-800 border-slate-100 rounded-tl-none'
                          }`}>
                            {msg.text}
                          </div>
                          <p className={`text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] px-1 ${isAdmin ? 'text-right' : 'text-left'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Send Reply Form */}
              <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-slate-50/30 flex items-center gap-3 shrink-0">
                <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={`Send administrative reply to ${activeTicket.shop}...`}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-5 py-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all shadow-sm font-medium"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="p-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/20">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
                <MessageSquare className="w-8 h-8 text-slate-300 animate-pulse" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Select Communication</h3>
              <p className="text-[11px] text-slate-400 font-bold max-w-xs mt-2 leading-relaxed">Choose an active shop support ticket from the inbox to initiate a real-time administrative session.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
