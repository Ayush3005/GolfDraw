"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Heart, 
  Plus, 
  Globe,
  Star,
  MoreVertical,
  ShieldCheck,
  Building,
  Edit,
  Trash2,
  Check
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { EmptyState } from "@/components/shared/EmptyState"
import { CharityFormModal } from "./CharityFormModal"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface CharitiesClientProps {
  initialCharities: any[]
  activeCount: number
  featuredCount: number
}

export function CharitiesClient({ 
  initialCharities, 
  activeCount, 
  featuredCount 
}: CharitiesClientProps) {
  const router = useRouter()
  const [charities, setCharities] = useState(initialCharities)
  const [selectedCharity, setSelectedCharity] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Sync state with server data
  useEffect(() => {
    setCharities(initialCharities)
  }, [initialCharities])

  const openAdd = () => {
    setSelectedCharity(null)
    setIsModalOpen(true)
  }

  const openEdit = (charity: any) => {
    setSelectedCharity(charity)
    setIsModalOpen(true)
  }

  const toggleStatus = async (charity: any) => {
    const newStatus = !charity.is_active
    try {
      const res = await fetch(`/api/charities/${charity.id}`, {
        method: charity.is_active ? 'DELETE' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: charity.is_active ? undefined : JSON.stringify({ is_active: true })
      })

      if (res.ok) {
        toast.success(`Charity ${newStatus ? 'activated' : 'deactivated'}`)
        router.refresh()
      } else {
        toast.error("Failed to update charity status")
      }
    } catch (err) {
      toast.error("An error occurred")
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Charity Management" 
        subtitle="Approve and manage partner charities."
        action={
          <Button 
            onClick={openAdd}
            className="rounded-full font-bold bg-primary hover:bg-primary/90 text-white gap-2"
          >
            <Plus size={18} /> Add Charity
          </Button>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Partners" value={charities.length} icon={Building} />
        <StatCard label="Active" value={activeCount} icon={ShieldCheck} />
        <StatCard label="Featured" value={featuredCount} icon={Star} />
        <StatCard label="Impact Score" value="9.4" icon={Heart} />
      </div>

      {/* Main Table */}
      <Card className="border-border bg-card overflow-hidden">
        <CardContent className="p-0">
          {charities.length > 0 ? (
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
                      <StatusBadge status={charity.is_active ? 'active' : 'inactive'} />
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
                      <DropdownMenu>
                        <DropdownMenuTrigger className={cn(
                          buttonVariants({ variant: "ghost", size: "icon" }),
                          "rounded-full text-muted-foreground"
                        )}>
                          <MoreVertical size={18} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl font-bold">
                          <DropdownMenuItem onClick={() => openEdit(charity)} className="gap-2">
                            <Edit size={16} /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => toggleStatus(charity)}
                            className={charity.is_active ? "text-destructive gap-2" : "text-green-600 gap-2"}
                          >
                            {charity.is_active ? (
                              <><Trash2 size={16} /> Deactivate</>
                            ) : (
                              <><Check size={16} /> Activate</>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      <CharityFormModal 
        charity={selectedCharity}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  )
}
