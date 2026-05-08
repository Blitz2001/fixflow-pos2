'use client'

import { useState } from 'react'
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

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })
  const { register: rMagic, handleSubmit: hMagic, formState: { errors: eMagic } } = useForm<MagicForm>({ resolver: zodResolver(magicSchema) })

  const onPassword = async ({ email, password }: LoginForm) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast.success('Welcome back!')
      router.push(redirectTo)
      router.refresh()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Login failed')
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
      toast.success('Magic link sent!')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to send link')
    } finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col items-center gap-8 animate-fade-in">
      {/* Brand */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500/20 border border-brand-500/30 mb-4">
          <Wrench className="w-8 h-8 text-brand-400" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">RepairOS</h1>
        <p className="mt-1 text-slate-400 text-sm">Computer Shop POS & Management</p>
      </div>

      {/* Card */}
      <div className="w-full rounded-2xl p-8 bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl">
        {/* Mode tabs */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-6">
          {(['password', 'magic'] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === m ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}>
              {m === 'password' ? 'Password' : 'Magic Link'}
            </button>
          ))}
        </div>

        {/* Password form */}
        {mode === 'password' && (
          <form onSubmit={handleSubmit(onPassword)} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input id="login-email" type="email" autoComplete="email" placeholder="you@example.com"
                  {...register('email')}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition" />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input id="login-password" type={showPw ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••"
                  {...register('password')}
                  className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <button id="btn-login" type="submit" disabled={loading}
              className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</> : 'Sign In'}
            </button>
          </form>
        )}

        {/* Magic link form */}
        {mode === 'magic' && !magicSent && (
          <form onSubmit={hMagic(onMagic)} className="space-y-4">
            <p className="text-sm text-slate-400">We&apos;ll email you a one-click sign-in link.</p>
            <div>
              <label htmlFor="magic-email" className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input id="magic-email" type="email" autoComplete="email" placeholder="you@example.com"
                  {...rMagic('email')}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition" />
              </div>
              {eMagic.email && <p className="mt-1 text-xs text-red-400">{eMagic.email.message}</p>}
            </div>
            <button id="btn-magic" type="submit" disabled={loading}
              className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Sending…</> : 'Send Magic Link'}
            </button>
          </form>
        )}

        {mode === 'magic' && magicSent && (
          <div className="text-center py-4 space-y-3">
            <div className="text-5xl">📬</div>
            <h2 className="text-lg font-semibold text-white">Check your inbox</h2>
            <p className="text-sm text-slate-400">Click the link in your email to sign in instantly.</p>
            <button onClick={() => setMagicSent(false)} className="text-brand-400 text-sm hover:underline">Use a different email</button>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          No account?{' '}
          <Link href="/auth/signup" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Create one free</Link>
        </p>
      </div>
    </div>
  )
}
