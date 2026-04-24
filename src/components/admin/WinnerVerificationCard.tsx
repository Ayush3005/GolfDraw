/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { 
  CheckCircle2, 
  XCircle, 
  Banknote, 
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react"

interface WinnerVerificationCardProps {
  winner: any
  onClose: () => void
}

export function WinnerVerificationCard({ winner, onClose }: WinnerVerificationCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [adminNotes, setAdminNotes] = useState(winner.admin_notes || "")

  const updateStatus = async (verificationStatus?: string, payoutStatus?: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/winners/${winner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verification_status: verificationStatus,
          payout_status: payoutStatus,
          admin_notes: adminNotes
        })
      })

      if (res.ok) {
        toast.success("Winner status updated")
        onClose()
        router.refresh()
      } else {
        const json = await res.json()
        toast.error(json.error || "Failed to update status")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const matchTypeColors = {
    five_match: "bg-yellow-100 text-yellow-700 border-yellow-200",
    four_match: "bg-slate-200 text-slate-700 border-slate-300",
    three_match: "bg-orange-100 text-orange-700 border-orange-200"
  }

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      <div className="p-6 bg-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">{winner.user.full_name}</h3>
            <p className="text-sm text-muted-foreground">{winner.user.email}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Draw Month</p>
            <p className="font-medium">
              {new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date(winner.draw.draw_month))}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 items-center">
          <Badge className={matchTypeColors[winner.match_type as keyof typeof matchTypeColors]}>
            {winner.match_type.replace('_', ' ').toUpperCase()}
          </Badge>
          <div className="text-2xl font-black text-green-600">
            £{(winner.prize_amount_pence / 100).toFixed(2)}
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Proof Image Section */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <ImageIcon size={16} /> Evidence / Proof of Win
          </h4>
          {winner.proof_url ? (
            <div className="relative group rounded-lg overflow-hidden border bg-black aspect-video">
              <Image 
                src={winner.proof_url} 
                alt="Winner Proof" 
                fill
                className="object-contain"
                unoptimized={!winner.proof_url.includes('supabase.co')}
              />
              <a 
                href={winner.proof_url} 
                target="_blank" 
                rel="noreferrer"
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium"
              >
                <ExternalLink size={20} className="mr-2" /> View Full Size
              </a>
            </div>
          ) : (
            <div className="bg-slate-100 border-2 border-dashed rounded-lg p-12 text-center">
              <p className="text-sm text-muted-foreground italic">No proof uploaded by user yet.</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Admin Notes Section */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Administrative Notes</h4>
          <Textarea 
            placeholder="Add notes about verification or payout..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
            className="bg-white"
          />
        </div>
      </div>

      <div className="p-6 bg-white border-t flex flex-wrap gap-3">
        {winner.verification_status === 'pending' && (
          <>
            <Button 
              variant="destructive" 
              className="flex-1"
              onClick={() => updateStatus('rejected')}
              disabled={loading}
            >
              <XCircle size={16} className="mr-2" /> Reject
            </Button>
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => updateStatus('approved')}
              disabled={loading || !winner.proof_url}
            >
              <CheckCircle2 size={16} className="mr-2" /> Approve
            </Button>
          </>
        )}

        {winner.verification_status === 'approved' && winner.payout_status === 'unpaid' && (
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => updateStatus(undefined, 'paid')}
            disabled={loading}
          >
            <Banknote size={16} className="mr-2" /> Mark as Paid
          </Button>
        )}

        {winner.verification_status === 'rejected' && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => updateStatus('pending')}
            disabled={loading}
          >
            Reset to Pending
          </Button>
        )}

        {winner.payout_status === 'paid' && (
          <div className="w-full p-3 bg-blue-50 text-blue-700 text-center rounded-lg font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 size={18} /> Payout Completed
          </div>
        )}
      </div>
    </div>
  )
}
