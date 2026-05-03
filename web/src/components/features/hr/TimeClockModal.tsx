'use client'

import { useState, useTransition } from 'react'
import { processTimeClock } from '@/lib/actions/hr'
import { toast } from 'sonner'
import { Clock, X, Loader2, Delete } from 'lucide-react'

interface TimeClockModalProps {
  shopId: string
  isOpen: boolean
  onClose: () => void
}

export function TimeClockModal({ shopId, isOpen, onClose }: TimeClockModalProps) {
  const [pin, setPin] = useState('')
  const [isPending, startTransition] = useTransition()

  if (!isOpen) return null

  const handleNumberClick = (num: number) => {
    if (pin.length >= 4 || isPending) return
    const newPin = pin + num
    setPin(newPin)
    
    // Auto-submit when 4 digits are entered
    if (newPin.length === 4) {
      submitPin(newPin)
    }
  }

  const handleDelete = () => {
    if (isPending) return
    setPin(prev => prev.slice(0, -1))
  }

  const submitPin = (finalPin: string) => {
    startTransition(async () => {
      try {
        const result = await processTimeClock(finalPin, shopId)
        if (result.success) {
          if (result.action === 'clock_in') toast.success(result.message)
          if (result.action === 'clock_out') toast.info(result.message)
          setTimeout(() => {
            setPin('')
            onClose()
          }, 1500)
        } else {
          toast.error(result.message)
          setPin('')
        }
      } catch (err: any) {
        toast.error('An error occurred. Please try again.')
        setPin('')
      }
    })
  }

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-in fade-in" onClick={onClose} />
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-sm translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-2xl sm:rounded-3xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-brand-500/10 rounded-full">
            <Clock className="w-8 h-8 text-brand-500" />
          </div>
          <h2 className="text-xl font-bold">Staff Time Clock</h2>
          <p className="text-sm text-muted-foreground">Enter your 4-digit PIN</p>
        </div>

        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* PIN Dots display */}
        <div className="flex justify-center gap-4 py-6">
          {[0, 1, 2, 3].map((index) => (
            <div 
              key={index}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                index < pin.length 
                  ? 'bg-brand-500 scale-110 shadow-[0_0_10px_rgba(var(--brand-500),0.5)]' 
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Loading overlay */}
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 rounded-3xl backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
              <p className="text-sm font-bold animate-pulse text-brand-500 tracking-widest">VERIFYING...</p>
            </div>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              disabled={isPending}
              className="h-16 text-2xl font-semibold rounded-2xl bg-muted/50 hover:bg-muted transition-all active:scale-95 disabled:opacity-50"
            >
              {num}
            </button>
          ))}
          <div className="h-16"></div> {/* Empty space for bottom-left */}
          <button
            onClick={() => handleNumberClick(0)}
            disabled={isPending}
            className="h-16 text-2xl font-semibold rounded-2xl bg-muted/50 hover:bg-muted transition-all active:scale-95 disabled:opacity-50"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending || pin.length === 0}
            className="h-16 flex items-center justify-center text-xl font-semibold rounded-2xl bg-muted/50 hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-95 disabled:opacity-50"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

      </div>
    </>
  )
}
