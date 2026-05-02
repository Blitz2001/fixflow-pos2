'use server'

import { createServerClient } from '../supabase/server'
import { revalidatePath } from 'next/cache'

// Define explicit types matching the Phase 3 schema
interface InventoryItemInput {
  name: string
  brand?: string
  category: string
  cost_price: number
  sell_price: number
  sku?: string
  shop_id: string
}

export async function createInventoryItem(data: InventoryItemInput) {
  const supabase = await createServerClient()
  
  const { data: item, error } = await supabase
    .from('inventory_items')
    .insert({ ...data, quantity: 0 }) // triggers will handle quantity later
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard/inventory')
  return item
}

export async function addSerialNumbers(itemId: string, shopId: string, serials: string[]) {
  const supabase = await createServerClient()

  // Prepare records for bulk insert
  const records = serials.map(sn => ({
    item_id: itemId,
    shop_id: shopId,
    serial_number: sn,
    status: 'Available'
  }))

  const { error } = await supabase
    .from('serial_numbers')
    .insert(records)

  // NOTE: Our database trigger `sync_inventory_quantity_on_insert` will 
  // automatically update the `stock_quantity` on the inventory_items table!

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/inventory/${itemId}`)
  revalidatePath('/dashboard/inventory')
}

export async function assignPartToTicket(ticketId: string, serialId: string, shopId: string) {
  const supabase = await createServerClient()

  // Update the serial number to be assigned to the ticket
  const { error } = await supabase
    .from('serial_numbers')
    .update({ 
      ticket_id: ticketId,
      status: 'Sold'
    })
    .eq('id', serialId)
    .eq('shop_id', shopId)

  // NOTE: Our database trigger `sync_inventory_quantity_on_assign` will 
  // automatically decrement the `stock_quantity` because status changed to 'Sold'.

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/tickets/${ticketId}`)
  revalidatePath('/dashboard/inventory')
}
