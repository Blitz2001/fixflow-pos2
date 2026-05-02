'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { processDirectSale } from '@/lib/actions/finance'
import { toast } from 'sonner'
import { Search, ShoppingCart, Plus, Minus, Trash2, Receipt, CreditCard, Banknote, Landmark, SmartphoneNfc, Package, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'

export function DirectPOSForm({ shopId }: { shopId: string }) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [items, setItems] = useState<any[]>([])
  const [serials, setSerials] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  // Cart state
  const [cart, setCart] = useState<any[]>([]) // { cartId, item_id, serial_id, name, quantity, unit_price, cost_price, is_serialized, serial_number }
  const [discount, setDiscount] = useState<number>(0)
  const [paymentType, setPaymentType] = useState('Cash')

  useEffect(() => {
    // Fetch all inventory items for the shop
    supabase
      .from('inventory_items')
      .select('*')
      .eq('shop_id', shopId)
      .gt('quantity', 0)
      .order('name')
      .then(({ data }) => {
        setItems(data || [])
        setLoading(false)
      })

    // Fetch all available serials for the shop
    supabase
      .from('serial_numbers')
      .select('id, item_id, serial_number')
      .eq('shop_id', shopId)
      .eq('status', 'Available')
      .then(({ data }) => setSerials(data || []))
  }, [shopId, supabase])

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleAddToCart = (item: any) => {
    if (item.is_serialized) {
      // For serialized items, we must select a serial number first.
      // Instead of complex modal, we just add a "pending serial" cart item.
      const newCartItem = {
        cartId: Math.random().toString(36).substring(7),
        item_id: item.id,
        serial_id: null, // Needs to be selected
        serial_number: '',
        name: item.name,
        quantity: 1, // Always 1 for serialized
        unit_price: item.sell_price,
        cost_price: item.cost_price,
        is_serialized: true
      }
      setCart([...cart, newCartItem])
    } else {
      // Bulk item
      const existingItem = cart.find(c => c.item_id === item.id && !c.is_serialized)
      if (existingItem) {
        if (existingItem.quantity >= item.quantity) {
          toast.error(`Only ${item.quantity} in stock!`)
          return
        }
        setCart(cart.map(c => c.cartId === existingItem.cartId ? { ...c, quantity: c.quantity + 1 } : c))
      } else {
        setCart([...cart, {
          cartId: Math.random().toString(36).substring(7),
          item_id: item.id,
          serial_id: null,
          serial_number: null,
          name: item.name,
          quantity: 1,
          unit_price: item.sell_price,
          cost_price: item.cost_price,
          is_serialized: false
        }])
      }
    }
  }

  const updateQuantity = (cartId: string, delta: number, maxStock: number) => {
    setCart(cart.map(c => {
      if (c.cartId === cartId) {
        const newQ = c.quantity + delta
        if (newQ > maxStock) {
          toast.error(`Only ${maxStock} in stock!`)
          return c
        }
        if (newQ < 1) return c
        return { ...c, quantity: newQ }
      }
      return c
    }))
  }

  const removeFromCart = (cartId: string) => {
    setCart(cart.filter(c => c.cartId !== cartId))
  }

  const handleAssignSerial = (cartId: string, serialId: string, serialNumber: string) => {
    // Ensure this serial isn't already in the cart
    if (cart.some(c => c.serial_id === serialId)) {
      toast.error('This serial number is already in the cart!')
      return
    }
    setCart(cart.map(c => c.cartId === cartId ? { ...c, serial_id: serialId, serial_number: serialNumber } : c))
  }

  const subtotal = cart.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0)
  const grandTotal = subtotal - (discount || 0)

  // Validate cart before checkout
  const canCheckout = cart.length > 0 && cart.every(c => !c.is_serialized || c.serial_id !== null)

  const handleCheckout = async () => {
    if (!canCheckout) return
    setCheckoutLoading(true)
    try {
      await processDirectSale(shopId, paymentType, cart, discount || 0)
      toast.success('Sale completed successfully!')
      router.push('/dashboard/sales')
    } catch (e: any) {
      toast.error(e.message || 'Checkout failed')
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      
      {/* LEFT: Inventory Catalog */}
      <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-accent/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name, category, or SKU..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading inventory...
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleAddToCart(item)}
                  className="text-left bg-background border border-border hover:border-brand-500 hover:shadow-sm p-3 rounded-xl transition-all group flex flex-col"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-1.5 py-0.5 bg-accent text-muted-foreground rounded text-[10px] font-bold uppercase tracking-wider">{item.category}</span>
                    {item.is_serialized ? (
                      <span className="text-amber-500" title="Serialized Part"><Package className="w-3.5 h-3.5" /></span>
                    ) : null}
                  </div>
                  <h3 className="font-semibold text-foreground text-sm line-clamp-2 leading-tight mb-2 group-hover:text-brand-500 transition-colors flex-1">{item.name}</h3>
                  <div className="flex items-end justify-between w-full mt-auto pt-2 border-t border-border/50">
                    <span className="font-bold text-brand-500 text-sm">{item.sell_price} LKR</span>
                    <span className="text-xs font-medium text-muted-foreground">{item.quantity} in stock</span>
                  </div>
                </button>
              ))}
              {filteredItems.length === 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground text-sm">
                  No items found in inventory.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Cart & Checkout */}
      <div className="w-full lg:w-[400px] shrink-0 flex flex-col bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        
        {/* Cart Header */}
        <div className="p-4 border-b border-border bg-brand-500 text-white flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Current Sale</h2>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">{cart.length} Items</span>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-accent/10">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60">
              <ShoppingCart className="w-12 h-12 mb-3" />
              <p className="text-sm">Cart is empty</p>
              <p className="text-xs mt-1 text-center">Click items on the left to add them to the sale.</p>
            </div>
          ) : (
            cart.map(c => {
              const dbItem = items.find(i => i.id === c.item_id)
              const maxStock = dbItem?.quantity || 0
              const itemSerials = serials.filter(s => s.item_id === c.item_id)

              return (
                <div key={c.cartId} className="bg-background border border-border rounded-xl p-3 shadow-sm relative">
                  <button onClick={() => removeFromCart(c.cartId)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-sm transition-transform hover:scale-110">
                    <Trash2 className="w-3 h-3" />
                  </button>
                  
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-foreground text-sm pr-4">{c.name}</p>
                    <p className="font-semibold text-brand-500 text-sm whitespace-nowrap">{c.unit_price * c.quantity} LKR</p>
                  </div>

                  {c.is_serialized ? (
                    <div className="mt-2">
                      <select 
                        className={`w-full text-xs py-1.5 px-2 rounded-lg border focus:ring-2 focus:ring-brand-500 ${c.serial_id ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400 font-mono' : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400 font-medium'}`}
                        value={c.serial_id || ''}
                        onChange={(e) => {
                          const sn = itemSerials.find(s => s.id === e.target.value)?.serial_number || ''
                          handleAssignSerial(c.cartId, e.target.value, sn)
                        }}
                      >
                        <option value="">-- Require Serial Number! --</option>
                        {itemSerials.map(s => (
                          <option key={s.id} value={s.id} disabled={cart.some(cartItem => cartItem.serial_id === s.id && cartItem.cartId !== c.cartId)}>
                            {s.serial_number}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center bg-accent rounded-lg border border-border overflow-hidden">
                        <button onClick={() => updateQuantity(c.cartId, -1, maxStock)} className="w-7 h-7 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-foreground"><Minus className="w-3 h-3" /></button>
                        <span className="w-8 text-center text-xs font-semibold text-foreground">{c.quantity}</span>
                        <button onClick={() => updateQuantity(c.cartId, 1, maxStock)} className="w-7 h-7 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-foreground"><Plus className="w-3 h-3" /></button>
                      </div>
                      <span className="text-xs text-muted-foreground">{c.unit_price} LKR each</span>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Checkout Panel */}
        <div className="border-t border-border bg-background p-4 space-y-4 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10">
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Subtotal</span>
            <span className="font-semibold text-foreground">{subtotal} LKR</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Discount</span>
            <input 
              type="number" 
              min="0"
              value={discount || ''}
              onChange={(e) => setDiscount(Number(e.target.value))}
              placeholder="0"
              className="w-24 px-2 py-1 bg-accent border border-border rounded-lg text-right text-sm focus:ring-2 focus:ring-brand-500 font-semibold text-red-400" 
            />
          </div>

          <div className="border-t border-border border-dashed pt-3 pb-1 flex justify-between items-center">
            <span className="font-bold text-foreground">Total Due</span>
            <span className="text-2xl font-bold text-brand-500">{grandTotal} LKR</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <button onClick={() => setPaymentType('Cash')} className={`py-2 rounded-lg border text-xs font-bold transition-all flex flex-col items-center gap-1 ${paymentType === 'Cash' ? 'bg-brand-500/10 border-brand-500 text-brand-500' : 'bg-accent border-border text-muted-foreground hover:bg-accent/80'}`}><Banknote className="w-4 h-4" /> Cash</button>
            <button onClick={() => setPaymentType('Card')} className={`py-2 rounded-lg border text-xs font-bold transition-all flex flex-col items-center gap-1 ${paymentType === 'Card' ? 'bg-brand-500/10 border-brand-500 text-brand-500' : 'bg-accent border-border text-muted-foreground hover:bg-accent/80'}`}><CreditCard className="w-4 h-4" /> Card</button>
            <button onClick={() => setPaymentType('Bank Transfer')} className={`py-2 rounded-lg border text-xs font-bold transition-all flex flex-col items-center gap-1 ${paymentType === 'Bank Transfer' ? 'bg-brand-500/10 border-brand-500 text-brand-500' : 'bg-accent border-border text-muted-foreground hover:bg-accent/80'}`}><Landmark className="w-4 h-4" /> Transfer</button>
            <button onClick={() => setPaymentType('QR')} className={`py-2 rounded-lg border text-xs font-bold transition-all flex flex-col items-center gap-1 ${paymentType === 'QR' ? 'bg-brand-500/10 border-brand-500 text-brand-500' : 'bg-accent border-border text-muted-foreground hover:bg-accent/80'}`}><SmartphoneNfc className="w-4 h-4" /> QR</button>
          </div>

          <button
            onClick={handleCheckout}
            disabled={checkoutLoading || !canCheckout || grandTotal < 0}
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-lg"
          >
            {checkoutLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Receipt className="w-5 h-5" />} 
            {cart.length > 0 && !canCheckout ? 'Missing Serial Numbers' : 'Process Payment'}
          </button>

        </div>
      </div>
    </div>
  )
}
