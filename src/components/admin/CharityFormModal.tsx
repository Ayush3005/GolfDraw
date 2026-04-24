/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Switch } from "../ui/switch"

interface CharityFormModalProps {
  charity: any | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function CharityFormModal({ charity, isOpen, onOpenChange }: CharityFormModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
    website_url: "",
    is_featured: false
  })

  useEffect(() => {
    if (charity) {
      setFormData({
        name: charity.name || "",
        description: charity.description || "",
        image_url: charity.image_url || "",
        website_url: charity.website_url || "",
        is_featured: !!charity.is_featured
      })
    } else {
      setFormData({
        name: "",
        description: "",
        image_url: "",
        website_url: "",
        is_featured: false
      })
    }
  }, [charity, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const url = charity ? `/api/charities/${charity.id}` : "/api/charities"
      const method = charity ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success(charity ? "Charity updated" : "Charity created")
        onOpenChange(false)
        router.refresh()
      } else {
        const json = await res.json()
        toast.error(json.error || "Failed to save charity")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{charity ? "Edit Charity" : "Add New Charity"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Charity Name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell us about the charity..."
              required
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website_url">Website URL</Label>
            <Input
              id="website_url"
              type="url"
              value={formData.website_url}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              placeholder="https://example.com"
            />
          </div>
          <div className="flex items-center justify-between space-x-2 bg-slate-50 p-3 rounded-lg border">
            <div className="space-y-0.5">
              <Label htmlFor="is_featured">Featured Charity</Label>
              <p className="text-xs text-muted-foreground">Appears at the top of the user selection grid.</p>
            </div>
            <Switch
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked:any) => setFormData({ ...formData, is_featured: checked })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Charity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
