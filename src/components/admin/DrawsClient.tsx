"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Draw } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import CreateDrawModal from './CreateDrawModal'

interface DrawsClientProps {
  initialDraws: Draw[]
}

export default function DrawsClient({ initialDraws }: DrawsClientProps) {
  const router = useRouter()
  const [draws, setDraws] = useState(initialDraws)

  // Sync state with server data when props change
  useEffect(() => {
    setDraws(initialDraws)
  }, [initialDraws])
  const [loading, setLoading] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [simulationResult, setSimulationResult] = useState<any>(null)
  const [selectedDrawId, setSelectedDrawId] = useState<string | null>(null)

  // RUN SIMULATION
  const handleSimulate = async (drawId: string) => {
    setLoading(drawId)
    try {
      const res = await fetch(`/api/draws/${drawId}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Simulation failed')
      
      setSimulationResult(json)
      setSelectedDrawId(drawId)
      
      // Update draw status and winning numbers in local state
      setDraws(prev => prev.map(d => 
        d.id === drawId ? { ...d, status: 'simulated', winning_numbers: json.winningNumbers } : d
      ))
      toast.success('Simulation complete! Review results before publishing.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Simulation failed')
    } finally {
      setLoading(null)
    }
  }

  // PUBLISH DRAW
  const handlePublish = async (drawId: string) => {
    if (!confirm('Are you sure you want to publish this draw? This cannot be undone.')) return
    setLoading(drawId)
    try {
      const res = await fetch(`/api/draws/${drawId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Publish failed')
      setDraws(prev => prev.map(d => 
        d.id === drawId ? { ...d, status: 'published' } : d
      ))
      toast.success('Draw published! Winners have been recorded.')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Publish failed')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Draws</h1>
          <p className="text-muted-foreground mt-1">Manage monthly prize draws</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full gap-2"
        >
          <span>+</span> Create Draw
        </Button>
      </div>

      {/* Draws list */}
      <div className="space-y-4">
        {draws.length === 0 && (
          <Card className="p-12 text-center border-dashed">
            <p className="text-muted-foreground">No draws yet. Create your first draw.</p>
          </Card>
        )}
        
        {draws.map(draw => (
          <Card key={draw.id} className="p-6 overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg">
                    {new Date(draw.draw_month).toLocaleDateString('en-GB', { 
                      month: 'long', year: 'numeric' 
                    })}
                  </h3>
                  {/* Status badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    draw.status === 'published' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                    draw.status === 'simulated' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                    'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                  }`}>
                    {draw.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground font-medium">
                  <span>Mode: <span className="text-foreground capitalize">{draw.draw_mode}</span></span>
                  <span>Pool: <span className="text-foreground">£{((draw.total_pool_pence || 0) / 100).toFixed(2)}</span></span>
                  <span>Subscribers: <span className="text-foreground">{draw.subscriber_count || 0}</span></span>
                </div>
                
                {/* Show winning numbers if available */}
                {draw.winning_numbers && draw.winning_numbers.length > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Winning Numbers:</span>
                    <div className="flex gap-1.5">
                      {draw.winning_numbers.map((n, i) => (
                        <span key={i} className="w-8 h-8 rounded-lg bg-indigo-500 text-white text-sm font-black flex items-center justify-center shadow-sm">
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {draw.status === 'pending' && (
                  <Button
                    size="sm"
                    onClick={() => handleSimulate(draw.id)}
                    disabled={loading === draw.id}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-full px-4"
                  >
                    {loading === draw.id ? 'Simulating...' : 'Run Simulation'}
                  </Button>
                )}
                
                {draw.status === 'simulated' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSimulate(draw.id)}
                      disabled={loading === draw.id}
                      className="rounded-full font-bold border-muted-foreground/20"
                    >
                      Re-simulate
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handlePublish(draw.id)}
                      disabled={loading === draw.id}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-full px-4"
                    >
                      {loading === draw.id ? 'Publishing...' : 'Publish Draw'}
                    </Button>
                  </div>
                )}

                {draw.status === 'published' && (
                  <div className="flex items-center gap-1.5 text-green-500 bg-green-500/5 px-3 py-1.5 rounded-full border border-green-500/10">
                    <span className="font-bold text-sm">✓ Published</span>
                  </div>
                )}
              </div>
            </div>

            {/* Show simulation result if this draw was just simulated */}
            {simulationResult && selectedDrawId === draw.id && (
              <div className="mt-6 p-4 bg-muted/50 rounded-xl border border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
                <h4 className="font-bold text-sm uppercase tracking-tight text-muted-foreground mb-3">Simulation Results</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-card p-3 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground font-bold uppercase">5-Match</p>
                    <p className="text-xl font-black text-indigo-500">{simulationResult.winnerCount?.five || 0}</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground font-bold uppercase">4-Match</p>
                    <p className="text-xl font-black text-indigo-500">{simulationResult.winnerCount?.four || 0}</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground font-bold uppercase">3-Match</p>
                    <p className="text-xl font-black text-indigo-500">{simulationResult.winnerCount?.three || 0}</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground font-bold uppercase">Total Winners</p>
                    <p className="text-xl font-black text-indigo-500">
                      {(simulationResult.winnerCount?.five || 0) + 
                       (simulationResult.winnerCount?.four || 0) + 
                       (simulationResult.winnerCount?.three || 0)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Create Draw Modal */}
      <CreateDrawModal
        isOpen={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </div>
  )
}
