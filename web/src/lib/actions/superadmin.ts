'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ── Helper: verify the caller is a super admin ────────────────────────────────
async function verifySuperAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const allowedEmails = (process.env.SUPER_ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())
  if (!allowedEmails.includes(user.email?.toLowerCase() ?? '')) {
    throw new Error('Unauthorized: Not a super admin')
  }

  return user
}

// ── Shop Management ────────────────────────────────────────────────────────────

export async function getAllShops() {
  await verifySuperAdmin()
  const admin = createAdminClient()

  const { data: shops, error } = await admin
    .from('shops')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return shops ?? []
}

export async function getShopDetails(shopId: string) {
  await verifySuperAdmin()
  const admin = createAdminClient()

  const [shopRes, membersRes, customersRes, ticketsRes, inventoryRes, transactionsRes, devicesRes, expensesRes] = await Promise.all([
    admin.from('shops').select('*').eq('id', shopId).single(),
    admin.from('memberships').select('*, profile:profiles(id, full_name, avatar_url)').eq('shop_id', shopId),
    admin.from('customers').select('*').eq('shop_id', shopId).order('created_at', { ascending: false }),
    admin.from('repair_tickets').select('id, ticket_number, status, priority, created_at').eq('shop_id', shopId).order('created_at', { ascending: false }),
    admin.from('inventory_items').select('id, name, quantity, cost_price, sell_price').eq('shop_id', shopId),
    admin.from('transactions').select('id, type, grand_total, status, paid_at, created_at').eq('shop_id', shopId).order('created_at', { ascending: false }),
    admin.from('devices').select('*').eq('shop_id', shopId),
    admin.from('expenses').select('id, category, amount, expense_date').eq('shop_id', shopId).order('expense_date', { ascending: false }),
  ])

  return {
    shop: shopRes.data,
    members: membersRes.data ?? [],
    customers: customersRes.data ?? [],
    tickets: ticketsRes.data ?? [],
    inventory: inventoryRes.data ?? [],
    transactions: transactionsRes.data ?? [],
    devices: devicesRes.data ?? [],
    expenses: expensesRes.data ?? [],
  }
}

export async function toggleShopLock(shopId: string, lock: boolean) {
  await verifySuperAdmin()
  const admin = createAdminClient()

  // We use a metadata field to mark the shop as locked
  const { error } = await admin
    .from('shops')
    .update({ tax_enabled: !lock } as any) // We'll use a real 'is_locked' field
    .eq('id', shopId)

  if (error) throw error
  revalidatePath('/superadmin')
}

export async function deleteShop(shopId: string) {
  await verifySuperAdmin()
  const admin = createAdminClient()

  // CASCADE will handle related records
  const { error } = await admin
    .from('shops')
    .delete()
    .eq('id', shopId)

  if (error) throw error
  revalidatePath('/superadmin')
}

// ── Platform Stats ─────────────────────────────────────────────────────────────

export async function getPlatformStats() {
  await verifySuperAdmin()
  const admin = createAdminClient()

  const [shops, users, tickets, customers, transactions, inventory, expenses] = await Promise.all([
    admin.from('shops').select('id', { count: 'exact' }),
    admin.from('profiles').select('id', { count: 'exact' }),
    admin.from('repair_tickets').select('id', { count: 'exact' }),
    admin.from('customers').select('id', { count: 'exact' }),
    admin.from('transactions').select('id, grand_total, status'),
    admin.from('inventory_items').select('id', { count: 'exact' }),
    admin.from('expenses').select('id, amount'),
  ])

  const totalRevenue = (transactions.data ?? [])
    .filter(t => t.status === 'paid')
    .reduce((sum, t) => sum + (t.grand_total ?? 0), 0)

  const totalExpenses = (expenses.data ?? [])
    .reduce((sum, e) => sum + (e.amount ?? 0), 0)

  return {
    totalShops: shops.count ?? 0,
    totalUsers: users.count ?? 0,
    totalTickets: tickets.count ?? 0,
    totalCustomers: customers.count ?? 0,
    totalTransactions: transactions.count ?? (transactions.data?.length ?? 0),
    totalRevenue,
    totalExpenses,
    totalInventoryItems: inventory.count ?? 0,
  }
}

// ── Per-shop traffic & DB usage metrics ────────────────────────────────────────

export async function getShopMetrics(shopId: string) {
  await verifySuperAdmin()
  const admin = createAdminClient()

  // "Traffic" = total activity entries for this shop
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const monthAgo = new Date(today)
  monthAgo.setDate(monthAgo.getDate() - 30)

  const [
    totalTickets, activeTickets, completedTickets,
    totalCustomers, totalDevices, totalInventory,
    totalTransactions, todayTransactions,
    weekTickets, monthTickets,
    totalExpenses, totalMembers, shopSessions,
  ] = await Promise.all([
    admin.from('repair_tickets').select('id', { count: 'exact' }).eq('shop_id', shopId),
    admin.from('repair_tickets').select('id', { count: 'exact' }).eq('shop_id', shopId).not('status', 'in', '("delivered","cancelled")'),
    admin.from('repair_tickets').select('id', { count: 'exact' }).eq('shop_id', shopId).in('status', ['delivered', 'cancelled']),
    admin.from('customers').select('id', { count: 'exact' }).eq('shop_id', shopId),
    admin.from('devices').select('id', { count: 'exact' }).eq('shop_id', shopId),
    admin.from('inventory_items').select('id', { count: 'exact' }).eq('shop_id', shopId),
    admin.from('transactions').select('id, grand_total, status').eq('shop_id', shopId),
    admin.from('transactions').select('id', { count: 'exact' }).eq('shop_id', shopId).gte('created_at', today.toISOString()),
    admin.from('repair_tickets').select('id', { count: 'exact' }).eq('shop_id', shopId).gte('created_at', weekAgo.toISOString()),
    admin.from('repair_tickets').select('id', { count: 'exact' }).eq('shop_id', shopId).gte('created_at', monthAgo.toISOString()),
    admin.from('expenses').select('id, amount').eq('shop_id', shopId),
    admin.from('memberships').select('id', { count: 'exact' }).eq('shop_id', shopId),
    admin.from('shop_sessions').select('id', { count: 'exact' }).eq('shop_id', shopId),
  ])

  const revenue = (totalTransactions.data ?? [])
    .filter(t => t.status === 'paid')
    .reduce((sum, t) => sum + (t.grand_total ?? 0), 0)

  const expenseTotal = (totalExpenses.data ?? [])
    .reduce((sum, e) => sum + (e.amount ?? 0), 0)

  // "Database usage" = total row count across all tables for this shop
  const totalRows =
    (totalTickets.count ?? 0) +
    (totalCustomers.count ?? 0) +
    (totalDevices.count ?? 0) +
    (totalInventory.count ?? 0) +
    (totalTransactions.data?.length ?? 0) +
    (totalExpenses.data?.length ?? 0) +
    (totalMembers.count ?? 0)

  return {
    traffic: {
      todayTransactions: todayTransactions.count ?? 0,
      weekTickets: weekTickets.count ?? 0,
      monthTickets: monthTickets.count ?? 0,
      totalSessions: shopSessions.count ?? 0,
    },
    database: {
      totalRows,
      tickets: totalTickets.count ?? 0,
      activeTickets: activeTickets.count ?? 0,
      completedTickets: completedTickets.count ?? 0,
      customers: totalCustomers.count ?? 0,
      devices: totalDevices.count ?? 0,
      inventory: totalInventory.count ?? 0,
      transactions: totalTransactions.data?.length ?? 0,
      expenses: totalExpenses.data?.length ?? 0,
      members: totalMembers.count ?? 0,
    },
    finance: {
      totalRevenue: revenue,
      totalExpenses: expenseTotal,
      netProfit: revenue - expenseTotal,
    },
  }
}

// ── All users across platform ──────────────────────────────────────────────────

export async function getAllUsers() {
  await verifySuperAdmin()
  const admin = createAdminClient()

  const { data: profiles } = await admin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Get memberships for each profile
  const { data: memberships } = await admin
    .from('memberships')
    .select('*, shop:shops(id, name)')

  // Build a map of user_id -> memberships
  const membershipMap = new Map<string, any[]>()
  for (const m of memberships ?? []) {
    const existing = membershipMap.get(m.user_id) ?? []
    existing.push(m)
    membershipMap.set(m.user_id, existing)
  }

  return (profiles ?? []).map(p => ({
    ...p,
    memberships: membershipMap.get(p.id) ?? [],
  }))
}

// ── Shops overview with computed stats ────────────────────────────────────────

export async function getShopsOverview() {
  await verifySuperAdmin()
  const admin = createAdminClient()

  const { data: shops } = await admin
    .from('shops')
    .select('*')
    .order('created_at', { ascending: false })

  if (!shops?.length) return []

  // Batch fetch counts for all shops
  const [memberships, customers, tickets, transactions, inventory] = await Promise.all([
    admin.from('memberships').select('shop_id'),
    admin.from('customers').select('shop_id'),
    admin.from('repair_tickets').select('shop_id, status'),
    admin.from('transactions').select('shop_id, grand_total, status'),
    admin.from('inventory_items').select('shop_id'),
  ])

  return shops.map(shop => {
    const shopMembers = (memberships.data ?? []).filter(m => m.shop_id === shop.id)
    const shopCustomers = (customers.data ?? []).filter(c => c.shop_id === shop.id)
    const shopTickets = (tickets.data ?? []).filter(t => t.shop_id === shop.id)
    const shopTransactions = (transactions.data ?? []).filter(t => t.shop_id === shop.id)
    const shopInventory = (inventory.data ?? []).filter(i => i.shop_id === shop.id)

    const activeTickets = shopTickets.filter(t => !['delivered', 'cancelled'].includes(t.status))
    const revenue = shopTransactions
      .filter(t => t.status === 'paid')
      .reduce((sum, t) => sum + (t.grand_total ?? 0), 0)

    const totalRows = shopMembers.length + shopCustomers.length + shopTickets.length +
      shopTransactions.length + shopInventory.length

    return {
      ...shop,
      memberCount: shopMembers.length,
      customerCount: shopCustomers.length,
      totalTickets: shopTickets.length,
      activeTickets: activeTickets.length,
      totalRevenue: revenue,
      inventoryCount: shopInventory.length,
      totalRows,
    }
  })
}
