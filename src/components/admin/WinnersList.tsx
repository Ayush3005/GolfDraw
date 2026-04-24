/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { WinnerVerificationCard } from "./WinnerVerificationCard";

interface WinnersListProps {
  winners: any[];
}

export function WinnersList({ winners }: WinnersListProps) {
  const [filter, setFilter] = useState("all");
  const [selectedWinner, setSelectedWinner] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredWinners = winners.filter((winner) => {
    if (filter === "all") return true;
    if (filter === "pending") return winner.verification_status === "pending";
    if (filter === "approved")
      return (
        winner.verification_status === "approved" &&
        winner.payout_status === "unpaid"
      );
    if (filter === "rejected") return winner.verification_status === "rejected";
    if (filter === "paid") return winner.payout_status === "paid";
    return true;
  });

  const openVerification = (winner: any) => {
    setSelectedWinner(winner);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Draw Month</TableHead>
              <TableHead>Winner</TableHead>
              <TableHead>Match</TableHead>
              <TableHead>Prize</TableHead>
              <TableHead>Proof</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payout</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWinners.length > 0 ? (
              filteredWinners.map((winner) => (
                <TableRow key={winner.id}>
                  <TableCell className="font-medium text-xs">
                    {new Intl.DateTimeFormat("en-GB", {
                      month: "short",
                      year: "numeric",
                    }).format(new Date(winner.draw.draw_month))}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {winner.user.full_name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {winner.user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {winner.match_type.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-green-600">
                    £{(winner.prize_amount_pence / 100).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {winner.proof_url ? (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 cursor-pointer"
                      >
                        <ImageIcon size={10} /> View
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">
                        Pending
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        winner.verification_status === "approved"
                          ? "success"
                          : winner.verification_status === "rejected"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {winner.verification_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        winner.payout_status === "paid"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {winner.payout_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openVerification(winner)}
                    >
                      <ExternalLink size={14} className="mr-2" /> Verify
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No winners found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-slate-50">
          {selectedWinner && (
            <WinnerVerificationCard
              winner={selectedWinner}
              onClose={() => setIsModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
