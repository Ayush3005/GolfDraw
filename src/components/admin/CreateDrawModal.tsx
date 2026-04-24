"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface CreateDrawModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateDrawModal({ isOpen, onOpenChange }: CreateDrawModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [drawMonth, setDrawMonth] = useState("")
  const [drawMode, setDrawMode] = useState("random")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!drawMonth) {
      toast.error("Please select a draw month")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/draws", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draw_month: `${drawMonth}-01`, // Ensure it's the first of the month
          mode: drawMode,
        }),
      })

      if (res.ok) {
        toast.success("Draw created successfully")
        onOpenChange(false)
        router.refresh()
      } else {
        const json = await res.json()
        toast.error(json.error || "Failed to create draw")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Monthly Draw</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="draw_month">Draw Month</Label>
            <Input
              id="draw_month"
              type="month"
              value={drawMonth}
              onChange={(e) => setDrawMonth(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="draw_mode">Draw Mode</Label>
            <Select 
              value={drawMode} 
              onValueChange={(val) => {
                if (val) setDrawMode(val)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="random">Random (Pure Lottery)</SelectItem>
                <SelectItem value="weighted">Weighted by Score Frequency</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Draw"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
