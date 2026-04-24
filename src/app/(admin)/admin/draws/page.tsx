import { supabaseAdmin } from '@/lib/supabase/admin'
import DrawsClient from '@/components/admin/DrawsClient'

export const dynamic = 'force-dynamic'

export default async function AdminDrawsPage() {
  const { data: draws } = await supabaseAdmin
    .from('draws')
    .select('*')
    .order('draw_month', { ascending: false })

  return (
    <div className="container mx-auto py-8">
      <DrawsClient initialDraws={draws || []} />
    </div>
  )
}
