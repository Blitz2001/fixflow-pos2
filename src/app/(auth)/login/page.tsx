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

// ── Validation schema ─────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

// ── Magic link schema ─────────────────────────────────────────────────────────
const magicSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type MagicFormValues = z.infer<typeof magicSchema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'
  const supabase = createClient()

  const [mode, setMode] = useState<'password' | 'magic'>('password')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)

  // ── Password login form ───────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const onPasswordLogin = async (values: LoginFormValues) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })
      if (error) throw error
      toast.success('Welcome back!')
      router.push(redirectTo)
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  // ── Magic link form ───────────────────────────────────────────────────────
  const {
    register: registerMagic,
    handleSubmit: handleMagicSubmit,
    formState: { errors: magicErrors },
  } = useForm<MagicFormValues>({ resolver: zodResolver(magicSchema) })

  const onMagicLink = async (values: MagicFormValues) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: values.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      setMagicSent(true)
      toast.success('Magic link sent! Check your inbox.')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send magic link'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto animate-fade-in">

      {/* Brand header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500/20 border border-brand-500/30 mb-4">
          <Wrench className="w-8 h-8 text-brand-400" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">RepairOS</h1>
        <p className="mt-1 text-slate-400 text-sm">Computer Shop POS & Management</p>
      </div>

      {/* Card */}
      <div className="glass-card w-full rounded-2xl p-8 bg-white/5 border-white/10 shadow-2xl backdrop-blur-xl">

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setMode('password')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'password'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => setMode('magic')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'magic'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Magic Link
          </button>
        </div>

        {/* ── Password form ─────────────────────────────────────────────── */}
        {mode === 'password' && (
          <form onSubmit={handleSubmit(onPasswordLogin)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <button
              id="btn-login"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        )}

        {/* ── Magic link form ───────────────────────────────────────────── */}
        {mode === 'magic' && !magicSent && (
          <form onSubmit={handleMagicSubmit(onMagicLink)} className="space-y-4">
            <p className="text-sm text-slate-400">
              Enter your email and we&apos;ll send you a one-click sign-in link.
            </p>
            <div>
              <label htmlFor="magic-email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="magic-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...registerMagic('email')}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                />
              </div>
              {magicErrors.email && (
                <p className="mt-1 text-xs text-red-400">{magicErrors.email.message}</p>
              )}
            </div>
            <button
              id="btn-magic-link"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending…
                </>
              ) : (
                'Send Magic Link'
              )}
            </button>
          </form>
        )}

        {/* Magic link sent confirmation */}
        {mode === 'magic' && magicSent && (
          <div className="text-center py-4 space-y-3">
            <div className="text-5xl">📬</div>
            <h2 className="text-lg font-semibold text-white">Check your inbox</h2>
            <p className="text-sm text-slate-400">
              We sent a magic link to your email. Click it to sign in instantly.
            </p>
            <button
              type="button"
              onClick={() => setMagicSent(false)}
              className="text-brand-400 text-sm hover:underline"
            >
              Use a different email
            </button>
          </div>
        )}

        {/* Footer link */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  )
}
