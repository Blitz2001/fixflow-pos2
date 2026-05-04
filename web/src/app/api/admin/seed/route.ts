import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  console.log('--- STARTING SEED ---')
  const admin = createAdminClient()
  
  try {
    console.log('1. Creating Shops...')
    const shopsData = [
      { name: 'Apex Tech Care', slug: 'apex-tech', address: '123 Tech Lane, Colombo', phone: '+94 77 111 2222', tax_enabled: true },
      { name: 'Urban Repair Hub', slug: 'urban-repair', address: '45 Hub Road, Kandy', phone: '+94 77 333 4444', tax_enabled: false },
      { name: 'Silicon Valley POS', slug: 'sv-pos', address: '88 Silicon St, Jaffna', phone: '+94 77 555 6666', tax_enabled: true },
    ]

    const { data: shops, error: shopErr } = await admin.from('shops').insert(shopsData).select()
    if (shopErr) throw shopErr

    for (const shop of shops) {
      // 2. Create Customers
      const customersData = Array.from({ length: 5 }).map((_, i) => ({
        shop_id: shop.id,
        full_name: `Customer ${i + 1} for ${shop.name}`,
        email: `cust${i + 1}_${shop.slug}@example.com`,
        phone: `+94 77 ${Math.floor(1000000 + Math.random() * 9000000)}`,
      }))
      const { data: customers, error: custErr } = await admin.from('customers').insert(customersData).select()
      if (custErr) throw custErr

      // 3. Create Inventory Items
      const inventoryData = [
        { shop_id: shop.id, name: 'iPhone 15 Screen', sku: 'SCR-I15', quantity: 10, cost_price: 25000, sell_price: 45000 },
        { shop_id: shop.id, name: 'MacBook Air Battery', sku: 'BAT-MBA', quantity: 5, cost_price: 15000, sell_price: 35000 },
        { shop_id: shop.id, name: 'Samsung S23 Port', sku: 'CHG-S23', quantity: 20, cost_price: 5000, sell_price: 12000 },
        { shop_id: shop.id, name: 'General Service', sku: 'SRV-GEN', quantity: 100, cost_price: 0, sell_price: 2500 },
        { shop_id: shop.id, name: 'Tempered Glass', sku: 'ACC-TG', quantity: 50, cost_price: 200, sell_price: 1500 },
      ]
      await admin.from('inventory_items').insert(inventoryData)

      // 4. Create Repair Tickets
      const ticketsData = customers.map((c, i) => ({
        shop_id: shop.id,
        customer_id: c.id,
        ticket_number: `${shop.slug.toUpperCase()}-${1000 + i}`,
        device_name: i % 2 === 0 ? 'iPhone 13' : 'Laptop HP',
        issue_description: 'Screen replacement and diagnostics',
        status: i === 0 ? 'pending' : i === 1 ? 'repairing' : 'delivered',
        priority: i === 0 ? 'high' : 'medium',
      }))
      await admin.from('repair_tickets').insert(ticketsData)

      // 5. Create Transactions (Revenue)
      const transactionsData = Array.from({ length: 5 }).map((_, i) => ({
        shop_id: shop.id,
        type: 'sale',
        grand_total: Math.floor(5000 + Math.random() * 50000),
        status: 'paid',
        payment_method: 'cash',
        paid_at: new Date().toISOString(),
      }))
      await admin.from('transactions').insert(transactionsData)
    }

    return NextResponse.json({ success: true, message: 'Platform seeded with test data successfully!' })
  } catch (err: any) {
    console.error('--- SEED FAILED ---')
    console.error('Error Message:', err.message)
    console.error('Error Details:', err)
    return NextResponse.json({ success: false, error: err.message, details: err }, { status: 500 })
  }
}
