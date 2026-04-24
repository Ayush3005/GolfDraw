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
import { Loader2, Shield, User as UserIcon, Calendar, CreditCard, Heart, Trophy } from "lucide-react"

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
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>User Details</SheetTitle>
          <SheetDescription>
            Detailed view and management for this user.
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-blue-600" />
          </div>
        ) : data ? (
          <div className="space-y-6 mt-6">
            {/* Profile Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-full">
                  <UserIcon size={24} className="text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{data.user.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{data.user.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={data.user.role === 'admin' ? 'default' : 'secondary'}>
                  {data.user.role}
                </Badge>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar size={12} className="mr-1" />
                  Joined {new Intl.DateTimeFormat('en-GB').format(new Date(data.user.created_at))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Subscription Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <CreditCard size={16} /> Subscription
              </h4>
              {data.subscription ? (
                <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="font-medium capitalize">{data.subscription.plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={data.subscription.status === 'active' ? 'success' : 'destructive'}>
                      {data.subscription.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">£{(data.subscription.amount_pence / 100).toFixed(2)}</span>
                  </div>
                  {data.subscription.current_period_end && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Renewal</span>
                      <span>{new Intl.DateTimeFormat('en-GB').format(new Date(data.subscription.current_period_end))}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground bg-slate-50 p-4 rounded-lg">No active subscription found.</p>
              )}
            </div>

            {/* Charity Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Heart size={16} /> Selected Charity
              </h4>
              {data.charity_selection ? (
                <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Charity</span>
                    <span className="font-medium">{(data.charity_selection as any).charity?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Portion</span>
                    <span className="font-medium">{data.charity_selection.contribution_percentage}%</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground bg-slate-50 p-4 rounded-lg">No charity selected.</p>
              )}
            </div>

            {/* Scores Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Trophy size={16} /> Recent Scores
              </h4>
              {data.scores && data.scores.length > 0 ? (
                <div className="space-y-2">
                  {data.scores.map((score: any) => (
                    <div key={score.id} className="flex justify-between items-center text-sm p-2 border rounded">
                      <span className="font-medium">{score.score_value} pts</span>
                      <span className="text-muted-foreground">{new Intl.DateTimeFormat('en-GB').format(new Date(score.score_date))}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No scores recorded.</p>
              )}
            </div>

            <Separator />

            {/* Admin Actions */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Admin Actions</h4>
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  onClick={toggleRole} 
                  disabled={updating}
                  className="w-full justify-start"
                >
                  <Shield size={16} className="mr-2" />
                  {data.user.role === 'admin' ? 'Demote to Subscriber' : 'Promote to Admin'}
                </Button>
                {data.subscription && data.subscription.status === 'active' && (
                  <Button 
                    variant="destructive" 
                    onClick={cancelSubscription} 
                    disabled={updating}
                    className="w-full justify-start"
                  >
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </div>
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
