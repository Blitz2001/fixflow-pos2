import { getBillingOverview } from '@/lib/actions/superadmin'
import BillingManagementInterface from './BillingManagementInterface'

export default async function BillingManagementPage() {
  const data = await getBillingOverview()
  return <BillingManagementInterface data={data} />
}
