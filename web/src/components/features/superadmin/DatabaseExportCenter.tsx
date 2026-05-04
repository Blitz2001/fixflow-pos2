'use client'

import { useState } from 'react'
import { Download, FileSpreadsheet, CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getShopDetails } from '@/lib/actions/superadmin'

interface Shop {
  id: string
  name: string
  totalRows: number
}

interface Props {
  shops: Shop[]
}

export function DatabaseExportCenter({ shops }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [exporting, setExporting] = useState(false)

  const toggleShop = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedIds.length === shops.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(shops.map(s => s.id))
    }
  }

  const handleExport = async () => {
    if (selectedIds.length === 0) {
      toast.error('Select at least one shop to export')
      return
    }

    setExporting(true)
    try {
      toast.loading('Preparing data export...', { id: 'export-toast' })
      
      const allData: any[] = []
      
      // Fetch details for each selected shop
      for (const id of selectedIds) {
        const details = await getShopDetails(id)
        const shopName = shops.find(s => s.id === id)?.name || 'Unknown'
        
        // Flatten data for CSV
        // For simplicity, we'll combine tickets, inventory, and transactions into one sheet with headers
        // Real-world use might separate these into tabs, but CSV is flat.
        
        // Header for this shop
        allData.push(['--- SHOP DATA START ---'])
        allData.push(['Shop Name', shopName])
        allData.push(['Export Date', new Date().toLocaleString()])
        allData.push([])

        // Tickets
        allData.push(['REPAIR TICKETS'])
        allData.push(['Ticket #', 'Device', 'Status', 'Priority', 'Date'])
        details.tickets.forEach(t => {
          allData.push([t.ticket_number, t.device_name, t.status, t.priority, new Date(t.created_at).toLocaleDateString()])
        })
        allData.push([])

        // Inventory
        allData.push(['INVENTORY ITEMS'])
        allData.push(['Name', 'SKU', 'Quantity', 'Cost Price', 'Sell Price'])
        details.inventory.forEach(i => {
          allData.push([i.name, i.sku, i.quantity, i.cost_price, i.sell_price])
        })
        allData.push([])

        // Transactions
        allData.push(['TRANSACTIONS'])
        allData.push(['ID', 'Type', 'Amount', 'Status', 'Date'])
        details.transactions.forEach(tr => {
          allData.push([tr.id, tr.type, tr.grand_total, tr.status, new Date(tr.created_at).toLocaleDateString()])
        })
        
        allData.push(['--- SHOP DATA END ---'])
        allData.push([])
        allData.push([])
      }

      // Generate CSV content
      const csvContent = allData.map(row => 
        row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ).join('\n')

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `RepairOS_Export_${new Date().toISOString().slice(0,10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('Database export complete!', { id: 'export-toast' })
    } catch (err: any) {
      console.error(err)
      toast.error('Export failed: ' + err.message, { id: 'export-toast' })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl shadow-2xl space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20 shadow-inner">
            <FileSpreadsheet className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Data Export Center</h2>
            <p className="text-white/40 text-sm font-medium">Export full platform data to Excel-compatible CSV format.</p>
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting || selectedIds.length === 0}
          className="flex items-center gap-3 px-8 py-4 bg-brand-500 hover:bg-brand-600 disabled:opacity-20 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all shadow-xl shadow-brand-500/20 active:scale-95 uppercase tracking-tighter italic"
        >
          {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          <span>{selectedIds.length > 0 ? `Export ${selectedIds.length} Shops` : 'Export Data'}</span>
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-6 mb-4">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Select Nodes for Extraction</p>
          <button 
            onClick={toggleAll}
            className="text-[10px] font-black text-brand-400 uppercase tracking-widest hover:text-brand-300 transition-colors"
          >
            {selectedIds.length === shops.length ? 'Deselect All' : 'Select All Shops'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map(shop => {
            const selected = selectedIds.includes(shop.id)
            return (
              <button
                key={shop.id}
                onClick={() => toggleShop(shop.id)}
                className={`flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 group ${
                  selected 
                    ? 'bg-brand-500/10 border-brand-500/30 shadow-lg shadow-brand-500/5' 
                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                }`}
              >
                <div className={`transition-colors ${selected ? 'text-brand-400' : 'text-white/20 group-hover:text-white/40'}`}>
                  {selected ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </div>
                <div className="text-left min-w-0">
                  <p className={`text-sm font-bold truncate tracking-tight transition-colors ${selected ? 'text-white' : 'text-white/60'}`}>
                    {shop.name}
                  </p>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                    {shop.totalRows.toLocaleString()} Rows
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
