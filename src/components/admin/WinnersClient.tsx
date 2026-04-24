"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Trophy, 
  Download, 
  Search, 
  Filter, 
  MoreVertical,
  CheckCircle,
  Clock,
  CircleDollarSign,
  Eye,
  Check,
  XCircle,
  Mail
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { EmptyState } from "@/components/shared/EmptyState"
import { WinnerVerificationCard } from "./WinnerVerificationCard"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { toast } from "sonner"

interface WinnersClientProps {
  initialWinners: any[]
  pendingCount: number
  totalPaidPence: number
}

export function WinnersClient({ 
  initialWinners, 
  pendingCount, 
  totalPaidPence 
}: WinnersClientProps) {
  const router = useRouter()
  const [winners, setWinners] = useState(initialWinners)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [selectedWinner, setSelectedWinner] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    setWinners(initialWinners)
  }, [initialWinners])

  const filteredWinners = winners.filter(winner => {
    const name = winner.users?.full_name?.toLowerCase() || ""
    const email = winner.users?.email?.toLowerCase() || ""
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || winner.payout_status === statusFilter || winner.verification_status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleExportCSV = () => {
    const headers = ["Winner", "Email", "Draw Month", "Match Type", "Prize Amount", "Status", "Payout"]
    const rows = filteredWinners.map(w => [
      w.users?.full_name || "Unknown",
      w.users?.email || "",
      w.draws?.draw_month || "",
      w.match_type,
      (w.prize_amount_pence / 100).toFixed(2),
      w.verification_status,
      w.payout_status
    ])

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `winners_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("CSV export started")
  }

  const handleAction = (winner: any) => {
    // Map the nested data structure to what WinnerVerificationCard expects
    const mappedWinner = {
      ...winner,
      user: winner.users,
      draw: winner.draws
    }
    setSelectedWinner(mappedWinner)
    setIsModalOpen(true)
  }

  const handleStatusUpdate = async (winnerId: string, data: any) => {
    try {
      const res = await fetch(`/api/admin/winners/${winnerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        toast.success("Status updated")
        router.refresh()
      } else {
        toast.error("Failed to update status")
      }
    } catch (err) {
      toast.error("An error occurred")
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Winners & Payouts" 
        subtitle="Verify and process prize distributions."
        action={
          <Button 
            onClick={handleExportCSV}
            variant="outline" 
            className="rounded-full font-bold border-border gap-2"
          >
            <Download size={18} /> Export CSV
          </Button>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Winners" value={winners.length} icon={Trophy} />
        <StatCard label="Pending Payouts" value={pendingCount} icon={Clock} />
        <StatCard label="Total Paid" value={`£${(totalPaidPence / 100).toLocaleString()}`} icon={CircleDollarSign} />
        <StatCard label="Approval Rate" value="98%" icon={CheckCircle} />
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search by winner name or email..." 
            className="pl-12 h-12 rounded-xl border-border bg-card font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(
            buttonVariants({ variant: "outline" }),
            "h-12 rounded-xl border-border gap-2 font-bold px-6"
          )}>
            <Filter size={18} /> {statusFilter ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) : 'All Statuses'}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl font-bold">
            <DropdownMenuItem onClick={() => setStatusFilter(null)}>All Statuses</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('pending')}>Pending Approval</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('approved')}>Approved (Unpaid)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('paid')}>Paid</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Table */}
      <Card className="border-border bg-card overflow-hidden">
        <CardContent className="p-0">
          {filteredWinners.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border bg-muted/30">
                  <TableHead className="font-bold text-muted-foreground py-4 pl-6">Winner</TableHead>
                  <TableHead className="font-bold text-muted-foreground py-4">Draw</TableHead>
                  <TableHead className="font-bold text-muted-foreground py-4">Prize Amount</TableHead>
                  <TableHead className="font-bold text-muted-foreground py-4">Status</TableHead>
                  <TableHead className="font-bold text-muted-foreground py-4 text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWinners.map((winner) => (
                  <TableRow key={winner.id} className="border-border hover:bg-muted/50 transition-colors">
                    <TableCell className="py-4 pl-6">
                      <div className="font-bold text-foreground">{winner.users?.full_name || "Unknown User"}</div>
                      <div className="text-xs text-muted-foreground font-medium">{winner.users?.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-bold text-foreground">
                        {winner.draws ? new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date(winner.draws.draw_month)) : 'N/A'}
                      </div>
                      <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                        {winner.match_type.replace('_', ' ')}
                      </div>
                    </TableCell>
                    <TableCell className="font-black text-foreground">
                      £{(winner.prize_amount_pence / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={winner.verification_status} />
                        <StatusBadge status={winner.payout_status} className="text-[9px] h-5" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        {winner.verification_status === 'pending' ? (
                          <Button 
                            onClick={() => handleAction(winner)}
                            size="sm" 
                            className="rounded-full font-bold bg-primary hover:bg-primary/90 text-white"
                          >
                            Verify
                          </Button>
                        ) : winner.verification_status === 'approved' && winner.payout_status === 'unpaid' ? (
                          <Button 
                            onClick={() => handleStatusUpdate(winner.id, { payout_status: 'paid' })}
                            size="sm" 
                            className="rounded-full font-bold bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Mark Paid
                          </Button>
                        ) : null}
                        <DropdownMenu>
                          <DropdownMenuTrigger className={cn(
                            buttonVariants({ variant: "ghost", size: "icon" }),
                            "rounded-full text-muted-foreground"
                          )}>
                            <MoreVertical size={18} />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-xl font-bold">
                            <DropdownMenuItem onClick={() => handleAction(winner)} className="gap-2">
                              <Eye size={16} /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(winner.id, { verification_status: 'approved' })} 
                              className="gap-2"
                              disabled={winner.verification_status === 'approved'}
                            >
                              <Check size={16} /> Approve Winner
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(winner.id, { verification_status: 'rejected' })}
                              className="text-destructive gap-2"
                              disabled={winner.verification_status === 'rejected'}
                            >
                              <XCircle size={16} /> Reject Winner
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => window.location.href = `mailto:${winner.users?.email}`}
                              className="gap-2"
                            >
                              <Mail size={16} /> Contact Winner
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState 
              icon={Trophy}
              title="No winners matched"
              description="Adjust your search or filters to see more records."
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-slate-50 border-none shadow-2xl">
          {selectedWinner && (
            <WinnerVerificationCard 
              winner={selectedWinner} 
              onClose={() => setIsModalOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
