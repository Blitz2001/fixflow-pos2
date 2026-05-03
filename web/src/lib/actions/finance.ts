'use server'

import { createServerClient } from '../supabase/server'
import { revalidatePath } from 'next/cache'

// ... existing processCheckout ...
export async function processCheckout(
  ticketId: string, 
  shopId: string, 
  paymentType: string,
  laborCharge: number,
  discount: number
) {
  const supabase = await createServerClient()

  // 1. Fetch ticket and assigned parts to calculate total
  const { data: ticket, error: ticketErr } = await supabase
    .from('repair_tickets')
    .select(`
      device:devices(partner_id),
      assigned_parts:serial_numbers(
        id,
        item:inventory_items(id, name, cost_price, sell_price)
      )
    `)
    .eq('id', ticketId)
    .single()

  if (ticketErr || !ticket) throw new Error('Failed to fetch ticket details')

  // 2. Calculate subtotal from parts
  let partsTotal = 0
  const transactionItems = []

  // Add parts as transaction line items
  for (const part of (ticket.assigned_parts || [])) {
    if (!part.item) continue
    partsTotal += part.item.sell_price
    transactionItems.push({
      inventory_item_id: part.item.id,
      serial_number_id: part.id,
      description: part.item.name,
      quantity: 1,
      cost_price_snapshot: part.item.cost_price,
      unit_price: part.item.sell_price,
      line_total: part.item.sell_price
    })
  }

  // Add labor as a line item if > 0
  if (laborCharge > 0) {
    transactionItems.push({
      description: 'Labor & Service Charge',
      quantity: 1,
      cost_price_snapshot: 0,
      unit_price: laborCharge,
      line_total: laborCharge
    })
  }

  const subtotal = partsTotal + laborCharge
  const grandTotal = subtotal - discount

  // 3. Create the Transaction record
  const { data: transaction, error: txnErr } = await supabase
    .from('transactions')
    .insert({
      shop_id: shopId,
      ticket_id: ticketId,
      partner_id: (ticket as any).device?.partner_id,
      type: 'repair_payment',
      payment_type: paymentType,
      subtotal,
      discount,
      grand_total: grandTotal,
      status: 'paid',
      paid_at: new Date().toISOString()
    })
    .select('id')
    .single()

  if (txnErr) throw new Error(txnErr.message)

  // 4. Create Transaction Line Items
  if (transactionItems.length > 0) {
    const itemsWithTxnId = transactionItems.map(item => ({
      ...item,
      transaction_id: transaction.id
    }))

    const { error: itemsErr } = await supabase
      .from('transaction_items')
      .insert(itemsWithTxnId)

    if (itemsErr) throw new Error(itemsErr.message)
  }

  // 5. Update Ticket Status to 'Completed'
  await supabase
    .from('repair_tickets')
    .update({ status: 'completed' })
    .eq('id', ticketId)

  revalidatePath('/dashboard/tickets')
  revalidatePath('/dashboard/sales')
  return transaction.id
}

export async function processDirectSale(
  shopId: string, 
  paymentType: string,
  cartItems: any[], // { item_id, serial_id, name, quantity, unit_price, cost_price }
  discount: number
) {
  const supabase = await createServerClient()

  let subtotal = 0
  const transactionItems = []

  for (const item of cartItems) {
    const lineTotal = item.unit_price * item.quantity
    subtotal += lineTotal

    transactionItems.push({
      inventory_item_id: item.item_id,
      serial_number_id: item.serial_id || null, // null for bulk items
      description: item.name,
      quantity: item.quantity,
      cost_price_snapshot: item.cost_price,
      unit_price: item.unit_price,
      line_total: lineTotal
    })
  }

  const grandTotal = subtotal - discount

  // 1. Create the Transaction record
  const { data: transaction, error: txnErr } = await supabase
    .from('transactions')
    .insert({
      shop_id: shopId,
      type: 'direct_sale',
      payment_type: paymentType,
      subtotal,
      discount,
      grand_total: grandTotal,
      status: 'paid',
      paid_at: new Date().toISOString()
    })
    .select('id')
    .single()

  if (txnErr) throw new Error(txnErr.message)

  // 2. Create Transaction Line Items
  // Note: the `inventory_decrement` database trigger on `transaction_items` 
  // will automatically decrease `inventory_items.quantity` for bulk items
  // AND set `serial_numbers.status = 'Sold'` for serialized items!
  if (transactionItems.length > 0) {
    const itemsWithTxnId = transactionItems.map(item => ({
      ...item,
      transaction_id: transaction.id
    }))

    const { error: itemsErr } = await supabase
      .from('transaction_items')
      .insert(itemsWithTxnId)

    if (itemsErr) throw new Error(itemsErr.message)
  }

  revalidatePath('/dashboard/inventory')
  revalidatePath('/dashboard/sales')
  return transaction.id
}


export async function addExpense(data: {
  shop_id: string
  category: string
  description?: string
  amount: number
  expense_date: string
}) {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('expenses')
    .insert({
      ...data,
      created_by: user?.id
    })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/expenses')
}
