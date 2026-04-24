/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useMemo } from "react"
import { CharityCard } from "./CharityCard"
import { CharitySelectModal } from "./CharitySelectModal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, Heart, X, Check } from "lucide-react"
import { EmptyState } from "@/components/shared/EmptyState"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CharityGridProps {
  charities: any[]
  currentSelectionId?: string
}

type FilterType = 'all' | 'featured'

export function CharityGrid({ charities, currentSelectionId }: CharityGridProps) {
  const [selectedCharity, setSelectedCharity] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  const filteredCharities = useMemo(() => {
    return charities.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesFilter = activeFilter === 'all' || (activeFilter === 'featured' && c.is_featured)
      
      return matchesSearch && matchesFilter
    })
  }, [charities, searchQuery, activeFilter])

  const handleCardClick = (charity: any) => {
    setSelectedCharity(charity)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-10">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search charities by name or cause..." 
            className="pl-12 h-14 rounded-2xl border-border bg-card font-medium focus:ring-primary/20 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(
              "inline-flex items-center justify-center gap-2 px-6 h-14 rounded-2xl font-bold border border-border bg-background hover:bg-muted transition-all flex-1 md:w-40 text-sm",
              activeFilter !== 'all' && "border-primary text-primary"
            )}>
              <Filter size={18} /> 
              {activeFilter === 'all' ? 'Filter' : 'Filtered'}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-border shadow-xl">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-black px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground">Show Only</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem 
                  checked={activeFilter === 'all'}
                  onCheckedChange={() => setActiveFilter('all')}
                  className="rounded-xl font-bold py-3"
                >
                  All Charities
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={activeFilter === 'featured'}
                  onCheckedChange={() => setActiveFilter('featured')}
                  className="rounded-xl font-bold py-3"
                >
                  Featured Causes
                </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="flex-1 h-14 rounded-2xl font-bold bg-primary px-8 text-white hover:bg-primary/90 shadow-lg shadow-primary/20">
            {searchQuery ? "Showing Results" : "Explore All"}
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchQuery || activeFilter !== 'all') && (
        <div className="flex flex-wrap items-center gap-3 animate-fade-in-up">
           <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mr-2">Active filters:</p>
           {searchQuery && (
             <Badge variant="secondary" className="pl-3 pr-1 py-1 rounded-full gap-2 bg-primary/5 text-primary border-primary/10">
                <span className="font-bold">&quot;{searchQuery}&quot;</span>
                <button onClick={() => setSearchQuery("")} className="hover:bg-primary/10 p-1 rounded-full transition-colors">
                  <X size={12} />
                </button>
             </Badge>
           )}
           {activeFilter === 'featured' && (
             <Badge variant="secondary" className="pl-3 pr-1 py-1 rounded-full gap-2 bg-amber-500/5 text-amber-600 border-amber-500/10">
                <span className="font-bold italic">Featured Only</span>
                <button onClick={() => setActiveFilter('all')} className="hover:bg-amber-500/10 p-1 rounded-full transition-colors">
                  <X size={12} />
                </button>
             </Badge>
           )}
           <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => { setSearchQuery(""); setActiveFilter('all'); }}
            className="text-xs font-black text-muted-foreground hover:text-foreground"
           >
            Clear All
           </Button>
        </div>
      )}

      {/* Grid */}
      {filteredCharities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCharities.map((charity) => (
            <div 
              key={charity.id} 
              onClick={() => handleCardClick(charity)}
              className="cursor-pointer"
            >
              <CharityCard 
                charity={charity} 
                isSelected={charity.id === currentSelectionId}
                isFeatured={charity.is_featured}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={Heart}
          title={searchQuery ? "No matches found" : "No charities available"}
          description={searchQuery ? `We couldn't find any charities matching "${searchQuery}". Try a different search term.` : "Check back later for new charities."}
        />
      )}

      {/* Modal */}
      <CharitySelectModal 
        charity={selectedCharity} 
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </div>
  )
}
