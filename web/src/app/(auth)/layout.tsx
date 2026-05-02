import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Sign In' }

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4">
      {/* Subtle dot-grid overlay */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  )
}
