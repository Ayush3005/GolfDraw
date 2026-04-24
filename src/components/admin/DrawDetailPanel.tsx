/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Loader2, Play, Send, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

interface DrawDetailPanelProps {
  draw: any | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function DrawDetailPanel({ draw, isOpen, onOpenChange }: DrawDetailPanelProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)

  const fetchDrawDetails = async () => {
    if (!draw) return
    setLoading(true)
    try {
      const res = await fetch(`/api/draws/${draw.id}`)
      const json = await res.json()
      if (res.ok) {
        setData(json.draw)
      } else {
        toast.error(json.error || "Failed to load draw details")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && draw) {
      fetchDrawDetails()
    } else if (!isOpen) {
      setData(null)
    }
  }, [isOpen, draw])

  const runSimulation = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/draws/${draw.id}/simulate`, { method: 'POST' })
      const json = await res.json()
      if (res.ok) {
        toast.success("Simulation complete")
        fetchDrawDetails()
        router.refresh()
      } else {
        toast.error(json.error || "Simulation failed")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const publishDraw = async () => {
    if (!confirm("Are you sure you want to publish this draw? This will notify winners and make results public.")) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/draws/${draw.id}/publish`, { method: 'POST' })
      if (res.ok) {
        toast.success("Draw published successfully")
        fetchDrawDetails()
        router.refresh()
      } else {
        const json = await res.json()
        toast.error(json.error || "Publishing failed")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            Draw Details — {draw && new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date(draw.draw_month))}
          </SheetTitle>
          <SheetDescription>
            Manage the draw lifecycle, simulation, and publishing.
          </SheetDescription>
        </SheetHeader>

        {loading && !data ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-blue-600" />
          </div>
        ) : data ? (
          <div className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Current Status</span>
              <Badge variant={
                data.status === 'published' ? 'success' : 
                data.status === 'simulated' ? 'secondary' : 'outline'
              }>
                {data.status.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Subscriber Count</p>
                <p className="font-bold">{data.subscriber_count}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Total Prize Pool</p>
                <p className="font-bold text-green-600">£{(data.total_pool_pence / 100).toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Draw Mode</p>
                <p className="font-medium capitalize">{data.draw_mode}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Jackpot</p>
                <p className="font-medium">£{(data.jackpot_amount_pence / 100).toFixed(2)}</p>
              </div>
            </div>

            {data.status === 'pending' && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-sm text-amber-800">
                  This draw is currently pending. You can run a simulation to see potential winners.
                </div>
                <Button className="w-full" onClick={runSimulation} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Play className="mr-2" size={16} />}
                  Run Simulation
                </Button>
              </div>
            )}

            {(data.status === 'simulated' || data.status === 'published') && (
              <div className="space-y-6">
                <Separator />
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Winning Numbers</h4>
                  <div className="flex gap-2">
                    {data.winning_numbers?.map((num: number, i: number) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                        {num}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Simulation Results</h4>
                  <div className="space-y-2">
                    {data.winners?.map((winner: any) => (
                      <div key={winner.id} className="flex justify-between items-center text-sm p-3 border rounded-lg bg-white">
                        <div>
                          <p className="font-medium">{winner.user?.full_name}</p>
                          <Badge variant="outline" className="text-[10px] uppercase">{winner.match_type.replace('_', ' ')}</Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">£{(winner.prize_amount_pence / 100).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                    {(!data.winners || data.winners.length === 0) && (
                      <p className="text-sm text-muted-foreground italic">No winners found in this simulation.</p>
                    )}
                  </div>
                </div>

                {data.status === 'simulated' && (
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" className="flex-1" onClick={runSimulation} disabled={loading}>
                      <RefreshCw className="mr-2" size={16} /> Re-run
                    </Button>
                    <Button className="flex-1" onClick={publishDraw} disabled={loading}>
                      <Send className="mr-2" size={16} /> Publish Results
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No data available
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
