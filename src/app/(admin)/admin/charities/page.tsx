import { auth } from "@/lib/auth/config"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Heart, 
  Plus, 
  Globe,
  Star,
  MoreVertical,
  ShieldCheck,
  Building
} from "lucide-react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/EmptyState"

export default async function AdminCharitiesPage() {
  const session = await auth()

  const { data: charities } = await supabaseAdmin
    .from("charities")
    .select("*")
    .order("name", { ascending: true })

  const { count: activeCharities } = await supabaseAdmin.from("charities").select("*", { count: "exact", head: true }).eq("status", "active")
  const { count: featuredCharities } = await supabaseAdmin.from("charities").select("*", { count: "exact", head: true }).eq("is_featured", true)

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Charity Management" 
        subtitle="Approve and manage partner charities."
        action={
          <Button className="rounded-full font-bold bg-primary hover:bg-primary/90 text-white gap-2">
            <Plus size={18} /> Add Charity
          </Button>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Partners" value={charities?.length || 0} icon={Building} />
        <StatCard label="Active" value={activeCharities || 0} icon={ShieldCheck} />
        <StatCard label="Featured" value={featuredCharities || 0} icon={Star} />
        <StatCard label="Impact Score" value="9.4" icon={Heart} />
      </div>

      {/* Main Table */}
      <Card className="border-border bg-card overflow-hidden">
        <CardContent className="p-0">
          {charities && charities.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border bg-muted/30">
                  <TableHead className="font-bold text-muted-foreground py-4 pl-6">Charity Name</TableHead>
                  <TableHead className="font-bold text-muted-foreground py-4">Status</TableHead>
                  <TableHead className="font-bold text-muted-foreground py-4">Featured</TableHead>
                  <TableHead className="font-bold text-muted-foreground py-4 text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charities.map((charity) => (
                  <TableRow key={charity.id} className="border-border hover:bg-muted/50 transition-colors">
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center font-black shrink-0">
                          {charity.name[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{charity.name}</div>
                          {charity.website_url && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                              <Globe size={10} /> {charity.website_url.replace(/^https?:\/\//, '')}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={charity.status} />
                    </TableCell>
                    <TableCell>
                      {charity.is_featured ? (
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-xs uppercase tracking-widest">
                          <Star size={14} fill="currentColor" /> Yes
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
                        <MoreVertical size={18} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState 
              icon={Heart}
              title="No charities found"
              description="Add your first partner charity to enable user donations."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
