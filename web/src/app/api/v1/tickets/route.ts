import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

/**
 * GET /api/v1/tickets
 *
 * Mobile-ready API endpoint (Phase 2 scaffold).
 * Returns active tickets for the authenticated user's shop.
 *
 * Query params:
 *   status  — filter by ticket status
 *   limit   — max results (default 50)
 *   offset  — pagination offset
 */
export async function GET(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const limit  = Math.min(Number(searchParams.get('limit')  ?? 50), 100)
  const offset = Number(searchParams.get('offset') ?? 0)

  const { data: membership } = await supabase
    .from('memberships')
    .select('shop_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'No shop found' }, { status: 403 })
  }

  let query = supabase
    .from('repair_tickets')
    .select(`
      id, ticket_number, status, priority, created_at,
      estimated_cost, actual_cost, estimated_completion_date,
      device:devices(model, brand, serial_number, customer:customers(name, phone_number))
    `)
    .eq('shop_id', membership.shop_id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq('status', status)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    data,
    meta: { total: count, limit, offset },
  })
}

// ── POST /api/v1/tickets ──────────────────────────────────────────────────────
const bodySchema = z.object({
  device_model:      z.string().min(1),
  issue_description: z.string().min(3),
  customer_name:     z.string().min(1),
  customer_phone:    z.string().min(5),
  priority:          z.enum(['low','normal','high','urgent']).default('normal'),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  // Delegate to the server action logic
  // (Mobile app will use this endpoint directly instead of Server Actions)
  try {
    const { createTicket } = await import('@/lib/actions/tickets')
    const { data: membership } = await supabase
      .from('memberships').select('shop_id').eq('user_id', user.id).single()
    if (!membership) return NextResponse.json({ error: 'No shop' }, { status: 403 })

    const ticket = await createTicket({
      shop_id:         membership.shop_id,
      customer_name:   parsed.data.customer_name,
      customer_phone:  parsed.data.customer_phone,
      device_model:    parsed.data.device_model,
      issue_description: parsed.data.issue_description,
      priority:        parsed.data.priority,
    })
    return NextResponse.json({ data: ticket }, { status: 201 })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
