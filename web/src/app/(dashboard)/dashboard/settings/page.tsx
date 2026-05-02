import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Shop details, taxes, team members</p>
      </div>
      <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-3">
        <Settings className="w-12 h-12 text-muted-foreground/30" />
        <p className="font-semibold text-foreground">Shop Settings</p>
        <p className="text-sm text-muted-foreground">VAT/SSCL toggles, team management & shop profile — Phase 4</p>
      </div>
    </div>
  )
}
