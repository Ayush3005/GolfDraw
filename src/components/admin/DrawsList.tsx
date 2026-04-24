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
import { Plus, Eye } from "lucide-react"
import CreateDrawModal from "./CreateDrawModal"
import { DrawDetailPanel } from "./DrawDetailPanel"

interface DrawsListProps {
  draws: any[]
}

export function DrawsList({ draws }: DrawsListProps) {
  const [selectedDraw, setSelectedDraw] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const openDrawDetail = (draw: any) => {
    setSelectedDraw(draw)
    setIsPanelOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={16} className="mr-2" /> Create Draw
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Subscribers</TableHead>
              <TableHead>Prize Pool</TableHead>
              <TableHead>Winners</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {draws.length > 0 ? (
              draws.map((draw) => (
                <TableRow key={draw.id}>
                  <TableCell className="font-medium">
                    {new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date(draw.draw_month))}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      draw.status === 'published' ? 'success' : 
                      draw.status === 'simulated' ? 'secondary' : 'outline'
                    }>
                      {draw.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{draw.draw_mode}</TableCell>
                  <TableCell>{draw.subscriber_count}</TableCell>
                  <TableCell>£{(draw.total_pool_pence / 100).toFixed(2)}</TableCell>
                  <TableCell>{draw.winner_count}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openDrawDetail(draw)}>
                      <Eye size={16} className="mr-2" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No draws found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CreateDrawModal 
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />

      <DrawDetailPanel 
        draw={selectedDraw} 
        isOpen={isPanelOpen} 
        onOpenChange={setIsPanelOpen} 
      />
    </div>
  )
}
