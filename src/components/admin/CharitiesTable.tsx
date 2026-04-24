/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Check } from "lucide-react"
import { CharityFormModal } from "./CharityFormModal"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface CharitiesTableProps {
  charities: any[]
}

export function CharitiesTable({ charities }: CharitiesTableProps) {
  const router = useRouter()
  const [selectedCharity, setSelectedCharity] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openEdit = (charity: any) => {
    setSelectedCharity(charity)
    setIsModalOpen(true)
  }

  const openAdd = () => {
    setSelectedCharity(null)
    setIsModalOpen(true)
  }

  const toggleStatus = async (charity: any) => {
    const newStatus = !charity.is_active
    try {
      const res = await fetch(`/api/charities/${charity.id}`, {
        method: charity.is_active ? 'DELETE' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: charity.is_active ? undefined : JSON.stringify({ is_active: true })
      })

      if (res.ok) {
        toast.success(`Charity ${newStatus ? 'activated' : 'deactivated'}`)
        router.refresh()
      } else {
        toast.error("Failed to update charity status")
      }
    } catch (err) {
      toast.error("An error occurred")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openAdd}>
          <Plus size={16} className="mr-2" /> Add Charity
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Subscribers</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {charities.length > 0 ? (
              charities.map((charity) => (
                <TableRow key={charity.id} className={!charity.is_active ? "opacity-60" : ""}>
                  <TableCell className="font-medium">{charity.name}</TableCell>
                  <TableCell>
                    {charity.is_featured ? (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Featured</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={charity.is_active ? 'success' : 'outline'}>
                      {charity.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{charity.subscriber_count}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(charity)}>
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleStatus(charity)}
                        title={charity.is_active ? "Deactivate" : "Activate"}
                      >
                        {charity.is_active ? <Trash2 size={16} className="text-destructive" /> : <Check size={16} className="text-green-600" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No charities found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CharityFormModal 
        charity={selectedCharity} 
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </div>
  )
}
