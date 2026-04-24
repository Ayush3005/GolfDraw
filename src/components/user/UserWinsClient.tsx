"use client"

import { useState } from "react"
import { Trophy, Calendar, CircleDollarSign, CheckCircle2, Clock, Upload, ImageIcon, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface UserWinsClientProps {
  initialWins: any[]
}

export function UserWinsClient({ initialWins }: UserWinsClientProps) {
  const router = useRouter()
  const [wins, setWins] = useState(initialWins)
  const [uploadingId, setUploadingId] = useState<string | null>(null)

  const handleUploadProof = (winId: string) => {
    // This would typically open a file picker and upload to Supabase storage
    toast.info("Proof upload functionality: Please select an image of your scorecard.")
    
    // Simulating file picker
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e: any) => {
      const file = e.target.files[0]
      if (!file) return

      setUploadingId(winId)
      try {
        // In a real app, upload to storage first
        // const { data, error } = await supabase.storage.from('proofs').upload(...)
        
        // Simulating upload success
        toast.success("Proof uploaded successfully! Admin will review it shortly.")
        router.refresh()
      } catch (err) {
        toast.error("Failed to upload proof")
      } finally {
        setUploadingId(null)
      }
    }
    input.click()
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wins.map((win) => (
        <Card key={win.id} className="border-border bg-card overflow-hidden group hover:shadow-xl transition-all duration-300 rounded-3xl">
          <div className="p-1 bg-gradient-to-r from-primary/20 to-primary/5 h-2" />
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Trophy size={24} />
              </div>
              <div className="text-right">
                <StatusBadge status={win.verification_status} className="mb-1" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {win.payout_status}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-foreground">£{(win.prize_amount_pence / 100).toFixed(2)}</span>
              </div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-tight flex items-center gap-1.5 mt-1">
                <CircleDollarSign size={14} className="text-primary" /> 
                {win.match_type.replace('_', ' ')}
              </p>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={14} />
                {new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date(win.draws.draw_month))}
              </div>
            </div>

            <div className="pt-4 space-y-3">
              {win.proof_url ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden border bg-muted group/img">
                  <Image 
                    src={win.proof_url} 
                    alt="Win Proof" 
                    fill 
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm" className="rounded-full font-bold gap-2" asChild>
                      <a href={win.proof_url} target="_blank" rel="noreferrer">
                        <ExternalLink size={14} /> View Full
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={() => handleUploadProof(win.id)}
                  disabled={uploadingId === win.id}
                  className="w-full rounded-2xl h-12 font-bold bg-primary text-white hover:bg-primary/90 gap-2"
                >
                  {uploadingId === win.id ? <Clock className="animate-spin" /> : <Upload size={18} />}
                  Upload Proof
                </Button>
              )}
              
              {win.verification_status === 'approved' && win.payout_status === 'unpaid' && (
                <div className="p-3 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl flex items-center gap-2">
                  <Clock size={14} /> Payout is being processed
                </div>
              )}
              
              {win.payout_status === 'paid' && (
                <div className="p-3 bg-green-50 text-green-700 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={14} /> Prize received on {new Intl.DateTimeFormat('en-GB').format(new Date(win.payout_at))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
