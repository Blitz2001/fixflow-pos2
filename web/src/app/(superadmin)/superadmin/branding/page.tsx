'use client'
 
import { useState } from 'react'
import { 
  Palette, Type, ImageIcon, Layout, 
  Globe, Save, RefreshCw, Eye, 
  Sparkles, CheckCircle2, Plus
} from 'lucide-react'
import { toast } from 'sonner'
 
export default function BrandingSystemPage() {
  const [isPropagating, setIsPropagating] = useState(false)
 
  const handlePropagate = () => {
    setIsPropagating(true)
    setTimeout(() => {
      setIsPropagating(false)
      toast.success('Platform identity successfully propagated to all instances.')
    }, 2000)
  }
 
  return (
    <div className="space-y-6 animate-fade-in pb-20 pt-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Identity System */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xs font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
                   <Layout className="w-3.5 h-3.5 text-blue-600" />
                   Global Platform Identity
                </h2>
                <button 
                  onClick={handlePropagate}
                  disabled={isPropagating}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
                >
                  {isPropagating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  {isPropagating ? 'Propagating...' : 'Propagate Changes'}
                </button>
              </div>
              
              <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform Alias</label>
                       <input 
                          type="text" 
                          defaultValue="RepairOS" 
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm text-slate-900 font-bold outline-none focus:border-blue-500/50 focus:bg-white transition-all shadow-inner"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Support Endpoint</label>
                       <input 
                          type="email" 
                          defaultValue="support@repairos.com" 
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm text-slate-900 font-bold outline-none focus:border-blue-500/50 focus:bg-white transition-all shadow-inner"
                       />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Brand Assets</label>
                    <div className="flex items-center gap-8 p-6 bg-slate-50 border border-slate-200 border-dashed rounded-3xl hover:bg-slate-100/50 transition-colors">
                       <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                          <ImageIcon className="w-6 h-6 text-slate-200" />
                       </div>
                       <div className="space-y-2">
                          <button className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black text-slate-900 uppercase tracking-widest transition-all shadow-sm">Upload Vector Logo</button>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">SVG Preferred • Max size 2MB</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Design System Engine */}
           <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <h2 className="text-xs font-black text-slate-900 tracking-tight uppercase mb-8 flex items-center gap-2">
                 <Palette className="w-3.5 h-3.5 text-fuchsia-600" />
                 Platform Design Engine
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-6">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Brand Accent Colors</p>
                    <div className="flex flex-wrap gap-3">
                       {['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'].map((color, i) => (
                          <div key={i} className="group relative">
                             <div 
                                className={`w-10 h-10 rounded-xl cursor-pointer border-2 transition-all ${i === 0 ? 'border-white ring-4 ring-blue-500/20 scale-110' : 'border-transparent hover:scale-105'}`} 
                                style={{ backgroundColor: color }} 
                             />
                             {i === 0 && <CheckCircle2 className="w-3 h-3 text-white absolute -top-1 -right-1 bg-blue-600 rounded-full p-0.5 shadow-xl" />}
                          </div>
                       ))}
                       <div className="w-10 h-10 rounded-xl border-2 border-slate-200 border-dashed flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-all">
                          <Plus className="w-4 h-4 text-slate-300" />
                       </div>
                    </div>
                 </div>
                 <div className="space-y-6">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">System Typography</p>
                    <div className="space-y-2">
                       <button className="w-full text-left p-3.5 bg-slate-900 border border-slate-900 rounded-2xl flex items-center justify-between group shadow-lg shadow-slate-200">
                          <span className="text-[11px] font-black text-white uppercase tracking-tight">Inter Workspace</span>
                          <Sparkles className="w-3 h-3 text-brand-400" />
                       </button>
                       <button className="w-full text-left p-3.5 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-2xl flex items-center justify-between group transition-all">
                          <span className="text-[11px] font-black text-slate-400 uppercase tracking-tight">Roboto Workspace</span>
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Live Workstation Preview */}
        <div className="space-y-6">
           <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm sticky top-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Real-time Preview</h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Live Instance</span>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 shadow-inner space-y-5">
                 <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-[10px] font-black shadow-md shadow-blue-200">R</div>
                    <p className="text-base font-black text-slate-900 uppercase tracking-tighter italic">RepairOS</p>
                 </div>
                 <div className="space-y-2">
                    <div className="h-1.5 w-full bg-slate-200/60 rounded-full" />
                    <div className="h-1.5 w-2/3 bg-slate-200/60 rounded-full" />
                 </div>
                 <div className="pt-2 flex gap-2">
                    <div className="px-3.5 py-2 bg-blue-600 rounded-xl text-[8px] font-black text-white uppercase tracking-widest shadow-md shadow-blue-100">Action</div>
                    <div className="px-3.5 py-2 bg-white rounded-xl text-[8px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 shadow-sm">Alt</div>
                 </div>
              </div>

              <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                 <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                 <p className="text-[10px] text-emerald-700 font-bold leading-relaxed uppercase tracking-tight">Design system propagate successful to all nodes.</p>
              </div>

              <button className="w-full mt-6 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm group">
                 <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                 Preview Client Viewport
              </button>
           </div>
        </div>
      </div>
    </div>
  )
}
