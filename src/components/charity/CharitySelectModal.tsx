/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { ExternalLink, Heart, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface CharitySelectModalProps {
  charity: any | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function CharitySelectModal({ charity, isOpen, onOpenChange }: CharitySelectModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [percentage, setPercentage] = useState(10)
  
  const monthlySubPortion = 500 // £5.00 portion of sub goes to charity pool

  useEffect(() => {
    if (isOpen) {
      setPercentage(10)
    }
  }, [isOpen])

  const handleSelect = async () => {
    if (!charity?.id) {
      toast.error("Invalid charity selection")
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch("/api/charity/selection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          charity_id: charity.id,
          contribution_percentage: percentage
        })
      })

      if (res.ok) {
        toast.success(`Selection updated: ${charity.name}`)
        onOpenChange(false)
        router.refresh()
      } else {
        const json = await res.json()
        toast.error(json.error || "Failed to save selection")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!charity) return null

  const calculatedAmount = Number.isNaN(percentage) ? 0 : (monthlySubPortion * (percentage / 100)) / 100

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[480px] p-0 overflow-hidden border-none rounded-[32px] md:rounded-[40px] shadow-2xl max-h-[90vh] flex flex-col">
        <div className="relative h-32 md:h-40 bg-muted overflow-hidden shrink-0">
          {charity.image_url ? (
            <Image 
              src={charity.image_url} 
              alt={charity.name} 
              fill
              className="object-cover opacity-30 blur-md scale-110"
              unoptimized={!charity.image_url.includes('supabase.co')}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-indigo-500/20" />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-background p-3 md:p-4 rounded-[24px] md:rounded-[32px] shadow-2xl border border-border w-24 h-24 md:w-28 md:h-28 flex items-center justify-center relative overflow-hidden">
              {charity.image_url ? (
                <Image 
                  src={charity.image_url} 
                  alt={charity.name} 
                  fill
                  className="object-contain p-2 md:p-3"
                  unoptimized={!charity.image_url.includes('supabase.co')}
                />
              ) : (
                <Heart className="text-primary" size={32} />
              )}
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10 space-y-6 md:space-y-8 overflow-y-auto custom-scrollbar">
          <DialogHeader className="space-y-1 md:space-y-2">
            <DialogTitle className="text-2xl md:text-3xl font-black text-center tracking-tight leading-tight">
              {charity.name}
            </DialogTitle>
            <div className="flex justify-center">
              <a 
                href={charity.website_url || "#"} 
                target="_blank" 
                rel="noreferrer" 
                className="text-[10px] md:text-xs font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full"
              >
                Learn More <ExternalLink size={10} />
              </a>
            </div>
          </DialogHeader>

          <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-center font-medium line-clamp-4 md:line-clamp-none">
            {charity.description}
          </p>

          <div className="space-y-4 md:space-y-6 bg-muted/50 p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-border">
            <div className="flex justify-between items-center mb-1 md:mb-2">
              <Label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">Portion</Label>
              <span className="text-2xl md:text-3xl font-black text-primary">{percentage}%</span>
            </div>
            
            <Slider 
              value={[percentage]} 
              onValueChange={(vals: any) => {
                const val = Array.isArray(vals) ? vals[0] : vals;
                if (typeof val === 'number') {
                  setPercentage(val);
                }
              }}
              min={10}
              max={100}
              step={5}
              className="py-2 md:py-4"
            />
            
            <div className="flex justify-between items-center pt-4 md:pt-6 border-t border-border">
              <span className="text-[10px] md:text-sm font-bold text-muted-foreground uppercase tracking-widest">Monthly Impact</span>
              <span className="text-lg md:text-xl font-black text-foreground">£{calculatedAmount.toFixed(2)}</span>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-3 md:gap-4">
            <Button 
              className="w-full rounded-2xl h-14 md:h-16 text-lg md:text-xl font-black bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20"
              onClick={handleSelect}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <span className="flex items-center gap-2">
                  Confirm Selection <CheckCircle2 size={18} />
                </span>
              )}
            </Button>
            <Button 
              variant="ghost" 
              className="w-full rounded-2xl h-10 md:h-12 font-bold text-muted-foreground hover:text-foreground text-sm"
              onClick={() => onOpenChange(false)}
            >
              Back to List
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
