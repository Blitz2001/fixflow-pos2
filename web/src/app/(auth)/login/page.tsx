'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Wrench, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be 6+ characters'),
})
type LoginForm = z.infer<typeof loginSchema>

const magicSchema = z.object({ email: z.string().email('Enter a valid email') })
type MagicForm = z.infer<typeof magicSchema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'
  const supabase = createClient()

  const [mode, setMode] = useState<'password' | 'magic'>('password')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<LoginForm>({ 
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  })
  
  const { register: rMagic, handleSubmit: hMagic, formState: { errors: eMagic } } = useForm<MagicForm>({ 
    resolver: zodResolver(magicSchema),
    defaultValues: { email: '' }
  })

  const onPassword = async ({ email, password }: LoginForm) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast.success('Welcome back to RepairOS!')
      
      if (email.toLowerCase() === 'akilainduwara205@gmail.com') {
        router.push('/superadmin')
      } else {
        router.push(redirectTo)
      }
      router.refresh()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Login failed. Please check your credentials.')
    } finally { setLoading(false) }
  }

  const onMagic = async ({ email }: MagicForm) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
      setMagicSent(true)
      toast.success('Check your email for the magic link!')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to send magic link.')
    } finally { setLoading(false) }
  }

  const [greeting, setGreeting] = useState('Good Morning')
  const [time, setTime] = useState(new Date())
  
  useEffect(() => {
    // Update greeting
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')

    // Update time every second
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formattedDate = time.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  })
  const formattedTime = time.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: true 
  })

  const emailValue = watch('email')
  const isAkila = emailValue?.toLowerCase().includes('akilainduwara205')

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col md:flex-row font-sans">
      {/* Background Layer */}
      <img 
        src="/repairos_landscape_auth.png" 
        alt="Background" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px]" />

      {/* Left Content Area */}
      <div className="relative z-10 flex-1 flex flex-col justify-center p-12 md:p-24 lg:p-32">
        <div className="animate-fade-in space-y-6">
          {/* Dynamic Brand Name */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#2d4356]/10 backdrop-blur-md border border-[#2d4356]/20 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-[#2d4356]" />
            </div>
            <span className="text-2xl font-black text-[#2d4356] tracking-tighter uppercase italic transition-all duration-500">
              {isAkila ? (
                <span className="animate-pulse text-brand-600">AKILA'S <span className="text-[#2d4356]">FIXFLOW</span></span>
              ) : (
                <>FixFlow <span className="opacity-50">POS</span></>
              )}
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-6xl md:text-8xl font-black text-[#2d4356] tracking-tighter leading-[0.8]">
              {greeting}
            </h1>
            <p className="text-xl md:text-2xl text-[#2d4356]/80 font-bold tracking-tight">
              Have a great journey ahead!
            </p>
          </div>

          {/* Date & Time Section */}
          <div className="pt-8 space-y-1 border-t border-[#2d4356]/10 max-w-xs">
            <p className="text-4xl font-black text-[#2d4356] tracking-tighter">
              {formattedTime}
            </p>
            <p className="text-sm font-bold text-[#2d4356]/60 uppercase tracking-[0.2em]">
              {formattedDate}
            </p>
          </div>
        </div>
      </div>

      {/* Right Content Area: Floating Card */}
      <div className="relative z-20 flex-1 flex items-center justify-center p-6 md:p-12 lg:p-24">
        <div className="w-full max-w-[420px] bg-[#3a5a78]/40 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-white/20 animate-slide-in">
          
          <div className="space-y-6">
            {/* Mode Switcher (Keep logic but style as text links if needed, or keep previous tabs) */}
            <div className="flex justify-center gap-6 mb-4">
              <button 
                onClick={() => { setMode('password'); setMagicSent(false); }}
                className={`text-sm font-bold tracking-wider transition-colors ${mode === 'password' ? 'text-white border-b-2 border-brand-400 pb-1' : 'text-white/50 hover:text-white'}`}
              >
                PASSWORD
              </button>
              <button 
                onClick={() => { setMode('magic'); setMagicSent(false); }}
                className={`text-sm font-bold tracking-wider transition-colors ${mode === 'magic' ? 'text-white border-b-2 border-brand-400 pb-1' : 'text-white/50 hover:text-white'}`}
              >
                MAGIC LINK
              </button>
            </div>

            {mode === 'password' && (
              <form onSubmit={handleSubmit(onPassword)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90 ml-1">User name</label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full px-5 py-3.5 bg-white/30 border border-white/20 rounded-2xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                  />
                  {errors.email && <p className="text-xs text-red-300 ml-1 font-medium">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90 ml-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('password')}
                      className="w-full px-5 py-3.5 bg-white/30 border border-white/20 rounded-2xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-300 ml-1 font-medium">{errors.password.message}</p>}
                </div>

                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded border-white/30 bg-white/20 checked:bg-brand-500" />
                    <span className="text-sm text-white/80 group-hover:text-white transition-colors">Remember me</span>
                  </label>
                  <button type="button" className="text-sm text-white/80 hover:text-white font-medium transition-colors underline decoration-white/20">
                    Forgot Password
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#24d0fe] to-[#1e96ff] hover:brightness-110 disabled:opacity-50 text-white font-bold text-lg rounded-full transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                </button>
              </form>
            )}

            {mode === 'magic' && !magicSent && (
              <form onSubmit={hMagic(onMagic)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90 ml-1">User email</label>
                  <input
                    type="email"
                    {...rMagic('email')}
                    className="w-full px-5 py-3.5 bg-white/30 border border-white/20 rounded-2xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                  />
                  {eMagic.email && <p className="text-xs text-red-300 ml-1 font-medium">{eMagic.email.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#24d0fe] to-[#1e96ff] hover:brightness-110 disabled:opacity-50 text-white font-bold text-lg rounded-full transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request Link'}
                </button>
              </form>
            )}

            {mode === 'magic' && magicSent && (
              <div className="text-center py-8 space-y-4 animate-fade-in text-white">
                <Mail className="w-12 h-12 mx-auto opacity-50" />
                <h3 className="text-xl font-bold">Check your inbox</h3>
                <p className="text-sm opacity-80">We've sent a sign-in link to your email.</p>
                <button onClick={() => setMagicSent(false)} className="text-xs font-bold underline opacity-60 hover:opacity-100 uppercase tracking-widest transition-opacity">Change Email</button>
              </div>
            )}

            <div className="pt-4 text-center">
              <p className="text-sm text-white/70">
                Don't have an account?{' '}
                <Link href="/signup" className="text-brand-300 hover:text-brand-200 font-bold ml-1 transition-colors">Sign Up</Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
