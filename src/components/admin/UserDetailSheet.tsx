/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/immutability */
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
import { Loader2, Shield, User as UserIcon, Calendar, CreditCard, Heart, Trophy, Mail, Ban } from "lucide-react"
import { StatusBadge } from "@/components/shared/StatusBadge"

interface UserDetailSheetProps {
  userId: string | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function UserDetailSheet({ userId, isOpen, onOpenChange }: UserDetailSheetProps) {
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserData()
    } else {
      setData(null)
    }
  }, [isOpen, userId])

  const fetchUserData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`)
      const json = await res.json()
      if (res.ok) {
        setData(json)
      } else {
        toast.error(json.error || "Failed to load user details")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const toggleRole = async () => {
    if (!data?.user) return
    const newRole = data.user.role === 'admin' ? 'subscriber' : 'admin'
    
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })
      const json = await res.json()
      if (res.ok) {
        setData({ ...data, user: json.user })
        toast.success(`Role updated to ${newRole}`)
      } else {
        toast.error(json.error || "Failed to update role")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setUpdating(false)
    }
  }

  const cancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel this subscription? This cannot be undone.")) return
    
    setUpdating(true)
    try {
      // Assuming there's an endpoint for this, or we use a generic one
      const res = await fetch(`/api/admin/subscriptions/${data.subscription.id}/cancel`, {
        method: 'POST'
      })
      if (res.ok) {
        toast.success("Subscription cancelled")
        fetchUserData() // Refresh data
      } else {
        const json = await res.json()
        toast.error(json.error || "Failed to cancel subscription")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 border-l border-border bg-card overflow-hidden flex flex-col">
        <div className="p-8 border-b border-border bg-muted/20">
          <SheetHeader className="text-left">
            <SheetTitle className="text-2xl font-black tracking-tight">User Profile</SheetTitle>
            <SheetDescription className="font-medium">
              Comprehensive overview of user activity and account status.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Loader2 className="animate-spin text-primary w-8 h-8" />
              <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading secure data...</p>
            </div>
          ) : data ? (
            <div className="space-y-10">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary font-black text-3xl shadow-inner">
                  {data.user.email[0].toUpperCase()}
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-foreground leading-tight">{data.user.full_name || "New User"}</h3>
                  <p className="text-muted-foreground font-bold flex items-center gap-2">
                    <Mail size={16} /> {data.user.email}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <StatusBadge status={data.user.role} />
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <Calendar size={12} /> Joined {new Intl.DateTimeFormat('en-GB').format(new Date(data.user.created_at))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 gap-6">
                {/* Subscription Card */}
                <div className="group rounded-3xl border border-border bg-card p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <CreditCard size={14} className="text-primary" /> Subscription
                    </h4>
                    {data.subscription && (
                      <StatusBadge status={data.subscription.status} />
                    )}
                  </div>
                  {data.subscription ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-2xl font-black text-foreground capitalize">{data.subscription.plan}</p>
                          <p className="text-sm font-bold text-muted-foreground">Monthly Plan</p>
                        </div>
                        <p className="text-2xl font-black text-primary">
                          £{(data.subscription.amount_pence / 100).toFixed(2)}
                          <span className="text-xs text-muted-foreground ml-1">/mo</span>
                        </p>
                      </div>
                      {data.subscription.current_period_end && (
                        <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs font-bold">
                          <span className="text-muted-foreground">NEXT RENEWAL</span>
                          <span className="text-foreground">{new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(data.subscription.current_period_end))}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-sm font-bold text-muted-foreground">No active subscription found.</p>
                    </div>
                  )}
                </div>

                {/* Charity Selection */}
                <div className="group rounded-3xl border border-border bg-card p-6 hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300">
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-4">
                    <Heart size={14} className="text-red-500" /> Selected Charity
                  </h4>
                  {data.charity_selection ? (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 font-black shrink-0">
                        {(data.charity_selection as any).charity?.name?.[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-foreground truncate">{(data.charity_selection as any).charity?.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-red-500 rounded-full" 
                              style={{ width: `${data.charity_selection.contribution_percentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-black text-red-500">{data.charity_selection.contribution_percentage}%</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-sm font-bold text-muted-foreground">No charity selected.</p>
                    </div>
                  )}
                </div>

                {/* Recent Scores */}
                <div className="group rounded-3xl border border-border bg-card p-6 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300">
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-4">
                    <Trophy size={14} className="text-amber-500" /> Recent Performance
                  </h4>
                  {data.scores && data.scores.length > 0 ? (
                    <div className="space-y-3">
                      {data.scores.map((score: any) => (
                        <div key={score.id} className="flex justify-between items-center bg-muted/30 p-3 rounded-xl border border-transparent hover:border-border hover:bg-muted/50 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-amber-600 font-black text-xs shadow-sm border border-border/50">
                              {score.score_value}
                            </div>
                            <span className="text-sm font-bold text-foreground">Stableford Points</span>
                          </div>
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                            {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(score.score_date))}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-sm font-bold text-muted-foreground">No recent scores found.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Control Zone */}
              <div className="pt-8 border-t border-border space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Admin Control Zone</h4>
                <div className="flex flex-col gap-3">
                  <Button 
                    variant="outline" 
                    onClick={toggleRole} 
                    disabled={updating}
                    className="rounded-2xl h-14 font-bold justify-start border-border hover:bg-muted px-6"
                  >
                    <Shield size={18} className="mr-3 text-primary" />
                    {data.user.role === 'admin' ? 'Remove Admin Privileges' : 'Make Administrator'}
                  </Button>
                  {data.subscription && data.subscription.status === 'active' && (
                    <Button 
                      variant="destructive" 
                      onClick={cancelSubscription} 
                      disabled={updating}
                      className="rounded-2xl h-14 font-bold justify-start bg-red-500/10 text-red-600 hover:bg-red-500/20 border-none px-6"
                    >
                      <Ban size={18} className="mr-3" />
                      Terminate Subscription
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
              <UserIcon size={48} strokeWidth={1} className="opacity-20" />
              <p className="font-bold">No user data found.</p>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-border bg-muted/20">
          <Button 
            className="w-full h-14 rounded-2xl font-black text-lg bg-foreground text-background hover:opacity-90 transition-opacity"
            onClick={() => onOpenChange(false)}
          >
            Close Details
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
