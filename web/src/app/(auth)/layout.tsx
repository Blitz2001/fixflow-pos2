import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Sign In' }

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#020617] relative overflow-hidden flex flex-col">
      {/* Edge-to-edge container */}
      <div className="flex-1 flex flex-col md:flex-row w-full h-full relative z-10">
        {children}
      </div>
    </div>
  )
}
