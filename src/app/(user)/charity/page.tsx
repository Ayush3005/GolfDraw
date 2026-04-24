import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card } from "@/components/ui/card"
import { Heart } from "lucide-react"
import { CharityGrid } from "@/components/charity/CharityGrid"

export default async function CharityPage() {
  const session = await auth()
  const email = session?.user?.email || ""

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", email)
    .single()

  if (!user) redirect("/login")

  // Fetch current selection using the correct table
  const { data: selection } = await supabaseAdmin
    .from("user_charity_selections")
    .select(`
      *,
      charity:charities(*)
    `)
    .eq("user_id", user.id)
    .maybeSingle()

  // Fetch all charities
  const { data: charities } = await supabaseAdmin
    .from("charities")
    .select("*")
    .order("name", { ascending: true })

  const currentSelectionId = selection?.charity_id

  return (
    <div className="space-y-12 pb-20">
      <PageHeader 
        title="Impact Selection" 
        subtitle="Every round counts. Choose the foundation your subscription supports."
      />

      {/* Current Selection Hero */}
      {selection?.charity && (
        <Card className="relative border-none bg-primary rounded-[32px] md:rounded-[50px] overflow-hidden shadow-2xl shadow-primary/20">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-1/4 hidden lg:block" />
          
          <div className="flex flex-col lg:flex-row relative z-10">
            <div className="flex-1 p-6 md:p-12 lg:p-16 space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 md:px-6 md:py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-[10px] md:text-xs font-black uppercase tracking-[0.2em] border border-white/10">
                Current selection
              </div>
              <div className="space-y-2 md:space-y-4">
                <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none">
                  {selection.charity.name}
                </h2>
                <p className="text-base md:text-lg lg:text-xl text-indigo-100 font-medium leading-relaxed max-w-2xl line-clamp-3 md:line-clamp-none">
                  {selection.charity.description}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-6 md:gap-12 pt-2 md:pt-4">
                <div className="space-y-0.5 md:space-y-1">
                  <p className="text-[10px] md:text-xs font-black text-indigo-200 uppercase tracking-widest">Selected since</p>
                  <p className="text-lg md:text-2xl font-black text-white">
                    {new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }).format(new Date(selection.updated_at))}
                  </p>
                </div>
                <div className="w-px h-8 md:h-12 bg-white/10 hidden sm:block" />
                <div className="space-y-0.5 md:space-y-1">
                  <p className="text-[10px] md:text-xs font-black text-indigo-200 uppercase tracking-widest">Contribution</p>
                  <p className="text-lg md:text-2xl font-black text-white">{selection.contribution_percentage}% of pool</p>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/3 bg-indigo-900/10 flex items-center justify-center p-8 md:p-12 border-t lg:border-t-0 lg:border-l border-white/5">
              <div className="relative w-24 h-24 md:w-48 md:h-48 flex items-center justify-center bg-white/5 rounded-full backdrop-blur-2xl border border-white/10">
                <Heart size={48} className="text-white fill-current opacity-20 animate-pulse md:hidden" />
                <Heart size={80} className="text-white fill-current opacity-20 animate-pulse hidden md:block lg:hidden" />
                <Heart size={120} className="text-white fill-current opacity-20 animate-pulse hidden lg:block" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-16 h-16 md:w-32 md:h-32 bg-white rounded-2xl md:rounded-[40px] shadow-2xl flex items-center justify-center p-3 md:p-6">
                      <Heart size={32} className="text-primary fill-current md:hidden" />
                      <Heart size={64} className="text-primary fill-current hidden md:block" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Interactive Grid */}
      <CharityGrid 
        charities={charities || []} 
        currentSelectionId={currentSelectionId} 
      />
    </div>
  )
}
