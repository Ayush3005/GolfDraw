/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, CheckCircle2, Star, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CharityCardProps {
  charity: any
  isSelected?: boolean
  isFeatured?: boolean
}

export function CharityCard({ charity, isSelected, isFeatured }: CharityCardProps) {
  return (
    <Card 
      className={cn(
        "group relative border-border bg-card overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 rounded-[32px]",
        isSelected && "border-2 border-green-500 shadow-xl shadow-green-500/10"
      )}
    >
      {/* Featured Badge */}
      {isFeatured && (
        <Badge className="absolute top-4 right-4 z-20 bg-amber-500 text-white font-black uppercase tracking-widest text-[10px] border-none px-3 py-1 shadow-lg">
          <Star size={10} className="mr-1 fill-white" /> Featured
        </Badge>
      )}

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-4 left-4 z-20 bg-green-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
          <CheckCircle2 size={16} />
        </div>
      )}

      {/* Image / Header Section */}
      <div className="h-48 w-full bg-muted relative overflow-hidden">
        {charity.image_url ? (
          <>
            <Image 
              src={charity.image_url} 
              alt={charity.name} 
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              unoptimized={!charity.image_url.includes('supabase.co')}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-indigo-500/10 flex items-center justify-center text-primary/20">
            <Heart size={64} className="fill-current" />
          </div>
        )}
      </div>

      <CardContent className="p-8">
        <h3 className="text-xl font-black text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-1">
          {charity.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-8 min-h-[2.5rem]">
          {charity.description || "No description available for this charity."}
        </p>
        
        <div className={cn(
          "flex items-center justify-between w-full p-4 rounded-2xl transition-all duration-300 font-bold",
          isSelected 
            ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
            : "bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/20"
        )}>
          <span className="text-sm">
            {isSelected ? "Currently Selected" : "Support Charity"}
          </span>
          <ArrowRight size={18} className={cn("transition-transform", !isSelected && "group-hover:translate-x-1")} />
        </div>
      </CardContent>
    </Card>
  )
}
