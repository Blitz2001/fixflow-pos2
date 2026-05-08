'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, MessageSquare, ShieldAlert, Sparkles, User, HelpCircle } from 'lucide-react'
import { getOrCreateSupportTicket, sendSupportMessage, SupportMessage, SupportTicket } from '@/lib/actions/support'
import { toast } from 'sonner'

interface SupportChatProps {
  shopId: string
  shopName: string
}

export default function SupportChat({ shopId, shopName }: SupportChatProps) {
  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  
  const chatEndRef = useRef<HTMLDivElement>(null)

  // 1. Initial Load & Background Polling (Every 2 seconds for ultra-reactive live chat)
  useEffect(() => {
    let active = true

    async function loadSupport() {
      try {
        const activeTicket = await getOrCreateSupportTicket(shopId, shopName)
        if (active) {
          setTicket(activeTicket)
          setLoading(false)
        }
      } catch (err) {
        console.error('Support ticket fetch error:', err)
      }
    }

    loadSupport()

    // Poll every 2 seconds
    const interval = setInterval(() => {
      loadSupport()
    }, 2000)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [shopId, shopName])

  // 2. Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ticket?.messages])

  // 3. Send Message
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || !ticket || sending) return

    const textToSend = input.trim()
    setInput('')
    setSending(true)

    // Optimistically add message for zero-latency local response
    const optimisticMessage: SupportMessage = {
      sender: 'shop',
      text: textToSend,
      timestamp: new Date().toISOString()
    }
    setTicket(prev => prev ? { ...prev, messages: [...prev.messages, optimisticMessage] } : null)

    try {
      const updatedMessages = await sendSupportMessage(ticket.id, 'shop', textToSend)
      setTicket(prev => prev ? { ...prev, messages: updatedMessages } : null)
    } catch (err) {
      toast.error('Failed to send message')
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center h-[500px]">
        <div className="w-12 h-12 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin mb-4" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Initializing Support Bridge...</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-50/50 border border-slate-200/60 rounded-[2rem] shadow-xl overflow-hidden backdrop-blur-md h-[600px] flex flex-col">
      {/* Messenger Header */}
      <div className="px-8 py-5 border-b border-slate-200/60 flex items-center justify-between bg-slate-50/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 tracking-tight leading-none mb-1">RepairOS Technical Support</h3>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" /> Live Support Agent Online
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="px-2.5 py-1 rounded-full bg-slate-200/50 border border-slate-200 text-[9px] font-black uppercase text-slate-500 tracking-wider">
            Ticket #{ticket?.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-slate-50/30">
        {ticket?.messages.map((msg, idx) => {
          const isShop = msg.sender === 'shop'
          return (
            <div key={idx} className={`flex ${isShop ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`flex items-start gap-3 max-w-[70%] ${isShop ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border text-xs font-black shadow-inner ${
                  isShop 
                    ? 'bg-brand-50 text-brand-600 border-brand-100' 
                    : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}>
                  {isShop ? shopName[0].toUpperCase() : 'AD'}
                </div>

                {/* Bubble */}
                <div className="space-y-1">
                  <div className={`p-4 rounded-[1.5rem] shadow-sm text-sm border font-medium ${
                    isShop 
                      ? 'bg-brand-500 text-white border-brand-600 rounded-tr-none' 
                      : 'bg-white text-slate-800 border-slate-200/60 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  <p className={`text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1 ${isShop ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="p-6 border-t border-slate-200/60 bg-slate-50/80 backdrop-blur-sm flex items-center gap-3 shrink-0">
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Describe your issue or type support message..."
          className="flex-1 bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-500/80 shadow-inner"
        />
        <button 
          type="submit"
          disabled={!input.trim() || sending}
          className="p-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
