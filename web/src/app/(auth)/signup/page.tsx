'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Wrench, Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const signupSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be 8+ characters'),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

type SignupForm = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async ({ email, password, full_name }: SignupForm) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      toast.success('Account created! Check your email to confirm.')
      router.push('/login')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
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
      <div className="relative z-10 flex-1 flex flex-col justify-center p-12 md:p-24 lg:p-32 text-[#2d4356]">
        <div className="animate-fade-in space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
            Start Your <br /> Journey.
          </h1>
          <p className="text-xl md:text-2xl opacity-80 font-medium">
            Join the elite network of tech repair shops today.
          </p>
        </div>
      </div>

      {/* Right Content Area: Floating Card */}
      <div className="relative z-20 flex-1 flex items-center justify-center p-6 md:p-12 lg:p-24">
        <div className="w-full max-w-[480px] bg-[#3a5a78]/40 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-white/20 animate-slide-in">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white tracking-tight">Register</h2>
            <p className="text-white/60 text-sm mt-1">Create your terminal credentials.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/90 ml-1">Full Name</label>
              <input
                type="text"
                placeholder="Alex Fernando"
                {...register('full_name')}
                className="w-full px-5 py-3 bg-white/30 border border-white/20 rounded-2xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
              />
              {errors.full_name && <p className="text-xs text-red-300 ml-1">{errors.full_name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-white/90 ml-1">Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                {...register('email')}
                className="w-full px-5 py-3 bg-white/30 border border-white/20 rounded-2xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
              />
              {errors.email && <p className="text-xs text-red-300 ml-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-white/90 ml-1">Password</label>
                <input
                  type={showPw ? 'text' : 'password'}
                  {...register('password')}
                  className="w-full px-5 py-3 bg-white/30 border border-white/20 rounded-2xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-white/90 ml-1">Confirm</label>
                <input
                  type="password"
                  {...register('confirm_password')}
                  className="w-full px-5 py-3 bg-white/30 border border-white/20 rounded-2xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                />
              </div>
            </div>
            {(errors.password || errors.confirm_password) && (
              <p className="text-xs text-red-300 ml-1">{errors.password?.message || errors.confirm_password?.message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#24d0fe] to-[#1e96ff] hover:brightness-110 disabled:opacity-50 text-white font-bold text-lg rounded-full transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-white/70">
              Already a member?{' '}
              <Link href="/login" className="text-brand-300 hover:text-brand-200 font-bold ml-1 transition-colors">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
