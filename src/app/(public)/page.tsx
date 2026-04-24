import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { 
  Heart, 
  Trophy, 
  CheckCircle2, 
  Zap,
  ChevronRight,
  Target,
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { cn } from "@/lib/utils"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background selection:bg-primary/10">
      {/* ── HERO SECTION ────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-20 md:pt-40 md:pb-32 px-6 overflow-hidden">
        {/* Subtle Background Textures */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_70%)]" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-[100px] animate-float" />
        </div>

        <div className="container max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            {/* Left: Content */}
            <div className="flex-1 text-center lg:text-left space-y-10">
              <ScrollReveal>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-4">
                  <Zap size={14} className="fill-current" /> Next Draw: £5,000 Jackpot
                </div>
              </ScrollReveal>

              <ScrollReveal delay={100}>
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.8] text-foreground">
                  Play for <br />
                  <span className="text-primary italic">Greater</span> <br />
                  Good.
                </h1>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-xl">
                  GolfDraw combines your monthly scores with charitable giving. Enter the monthly prize pool while supporting the causes that matter.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4 pt-6 w-full">
                  <Button size="lg" className="w-full sm:w-auto rounded-2xl h-16 sm:h-20 px-8 sm:px-12 text-lg sm:text-2xl font-black bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 transition-transform hover:scale-105" asChild>
                    <Link href="/signup">Join Now — £19.99</Link>
                  </Button>
                  <Button size="lg" variant="ghost" className="w-full sm:w-auto rounded-2xl h-16 sm:h-20 px-8 sm:px-10 text-lg sm:text-xl font-black text-muted-foreground hover:text-foreground hover:bg-muted" asChild>
                    <a href="#how-it-works" className="flex items-center justify-center gap-2">
                      How It Works <ChevronRight size={20} />
                    </a>
                  </Button>
                </div>
              </ScrollReveal>

              {/* Stats Mini Row */}
              <ScrollReveal delay={400}>
                <div className="flex items-center justify-between sm:justify-center lg:justify-start gap-4 sm:gap-12 pt-8 w-full max-w-sm sm:max-w-none mx-auto">
                  <div className="text-center sm:text-left">
                    <p className="text-xl sm:text-3xl font-black text-foreground">£12.4k</p>
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">Paid Out</p>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  <div className="text-center sm:text-left">
                    <p className="text-xl sm:text-3xl font-black text-foreground">£8.2k</p>
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">Donated</p>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  <div className="text-center sm:text-left">
                    <p className="text-xl sm:text-3xl font-black text-foreground">2.1k</p>
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">Players</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right: Premium Visual */}
            <ScrollReveal delay={200} className="flex-1 w-full max-w-xl lg:max-w-none">
              <div className="relative aspect-[4/5] rounded-[60px] overflow-hidden bg-muted shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] group">
                <Image 
                  src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2070&auto=format&fit=crop" 
                  alt="Premium Golf Experience"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Floating Info Card */}
                <div className="absolute bottom-10 left-10 right-10 p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 text-white animate-float">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-80">Last Winner</p>
                        <p className="text-lg font-black">Alex G. won £3,450</p>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                      <Trophy size={24} className="text-amber-400" />
                    </div>
                  </div>
                  <p className="text-sm font-medium opacity-90 leading-relaxed">
                    &quot;I entered my scores like any other month, and got the call. It&apos;s an amazing feeling knowing my golf supports the Golf Foundation too.&quot;
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── TRUST SECTION ────────────────────────────────────────────────── */}
      <section className="py-20 border-y border-border bg-muted/30">
        <div className="container max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground mb-12">Verified & Trusted By</p>
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-24 opacity-40 grayscale">
             {/* Use text-based logos for clean aesthetic */}
             <div className="text-2xl font-black tracking-tighter">GolfBase</div>
             <div className="text-2xl font-black tracking-tighter">ScoreCard+</div>
             <div className="text-2xl font-black tracking-tighter">FairwayAI</div>
             <div className="text-2xl font-black tracking-tighter">ClubMetrics</div>
          </div>
        </div>
      </section>

      {/* ── THE PROBLEM/SOLUTION ────────────────────────────────────────── */}
      <section className="py-32 px-6">
        <div className="container max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <ScrollReveal>
              <div className="space-y-6">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight text-foreground">Golf with <br />Purpose.</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Most golfers log their scores on apps and never look at them again. At GolfDraw, your data has power. 
                  Every score is a donation. Every score is an entry.
                </p>
                <ul className="space-y-4">
                  {[
                    "At least 10% goes to your chosen charity",
                    "Fair verification for all prize payouts",
                    "Automatic entry based on your natural play"
                  ].map(item => (
                    <li key={item} className="flex items-center gap-3 font-bold text-foreground">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <CheckCircle2 size={14} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200} className="relative">
              <div className="p-10 rounded-[60px] bg-primary text-white space-y-8 shadow-2xl shadow-primary/20">
                 <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center">
                    <Heart size={40} className="fill-current" />
                 </div>
                 <h3 className="text-4xl font-black tracking-tight leading-none">Your impact <br />last month:</h3>
                 <div className="space-y-2">
                    <p className="text-7xl font-black tracking-tighter">£1,420</p>
                    <p className="text-sm font-bold uppercase tracking-widest opacity-80 underline underline-offset-4">Sent to Junior Golf Academy</p>
                 </div>
                 <Button variant="ghost" className="w-full h-16 rounded-2xl bg-white/10 text-white font-black hover:bg-white/20">
                    See the Charity Leaderboard
                 </Button>
              </div>
              {/* Decorative element */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="scroll-mt-0 pt-8 pb-32 bg-muted/20">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground mb-4">Three Steps to Impact.</h2>
            <p className="text-muted-foreground text-xl font-medium">No complicated rules. Just golf.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Choose a Cause",
                desc: "Pick from over 50 verified golf and youth charities during signup. You control where the money goes.",
                icon: Heart,
                color: "text-red-500"
              },
              {
                step: "02",
                title: "Log Your Score",
                desc: "Enter your Stableford scores each month. The last 5 scores submitted become your entry numbers.",
                icon: Target,
                color: "text-primary"
              },
              {
                step: "03",
                title: "Win Payouts",
                desc: "If your numbers match the draw, you win the jackpot. Our team verifies your scores and pays out fast.",
                icon: Trophy,
                color: "text-amber-500"
              }
            ].map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 100} className="bg-card p-12 rounded-[50px] border border-border group hover:border-primary/50 transition-all">
                <div className="flex justify-between items-start mb-10">
                   <div className={cn("p-5 rounded-3xl bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors", item.color)}>
                      <item.icon size={40} />
                   </div>
                   <span className="text-6xl font-black text-muted/30">{item.step}</span>
                </div>
                <h3 className="text-2xl font-black text-foreground mb-4">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIZE POOL ─────────────────────────────────────────────────── */}
      <section className="py-32 px-6">
        <div className="container max-w-7xl mx-auto">
          <div className="bg-foreground text-background rounded-[70px] p-12 md:p-24 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 blur-[150px]" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
              <div>
                <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-8">Real Prizes.<br />Real Winners.</h2>
                <p className="text-xl text-muted-foreground font-medium mb-12">
                  Our prize pool scales with our membership. The more players join, the bigger the impact — and the bigger the payouts.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-8 rounded-[40px] bg-background/5 border border-background/10">
                    <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">5 Matches</p>
                    <p className="text-5xl font-black tracking-tighter">£3,995</p>
                    <p className="text-xs font-bold text-primary mt-1">THE JACKPOT</p>
                  </div>
                  <div className="p-8 rounded-[40px] bg-background/5 border border-background/10">
                    <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">4 Matches</p>
                    <p className="text-5xl font-black tracking-tighter">£3,496</p>
                    <p className="text-xs font-bold text-primary mt-1">35% OF POOL</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-8">
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-[16px] border-primary/20 flex flex-col items-center justify-center text-center animate-pulse-glow">
                   <p className="text-sm font-black uppercase tracking-widest opacity-60">Total Live Pool</p>
                   <p className="text-7xl md:text-9xl font-black tracking-tighter leading-none">£9k</p>
                </div>
                <Button size="lg" className="rounded-full bg-primary font-black px-12 h-18 text-xl shadow-2xl shadow-primary/40">
                  Join the Next Draw
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section className="py-32 bg-background">
        <div className="container max-w-3xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground">FAQ</h2>
          </div>

          <Accordion className="w-full space-y-4">
            {[
              { q: "How is the winner verified?", a: "Winners must provide a screenshot from their scoring platform (e.g., GolfNow, VPAR) matching the submitted numbers. Our admin team manually reviews each claim." },
              { q: "Can I cancel my subscription?", a: "Yes, you can cancel at any time from your dashboard. Your entries for the current month will remain valid until the next draw." },
              { q: "How much goes to charity?", a: "A minimum of 10% of every subscription fee is donated. In some months, we run special campaigns where this increases to 25% or more." },
              { q: "What is a Stableford score?", a: "It's a popular scoring system in golf where you earn points based on your performance on each hole. We use the total points from your round." }
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border rounded-[32px] px-8 bg-card transition-all hover:border-primary/30">
                <AccordionTrigger className="text-lg md:text-xl font-black hover:no-underline py-8 text-left">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-medium pb-8 leading-relaxed text-lg">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────── */}
      <section className="py-32 px-6 overflow-hidden">
        <div className="container max-w-7xl mx-auto">
          <div className="bg-primary rounded-[80px] p-12 md:p-32 text-center text-white space-y-12 relative">
             {/* Background Pattern */}
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white_0%,transparent_70%)]" />
             
             <div className="relative z-10 space-y-8">
               <h2 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.8] mb-8">
                 Make Your <br />
                 Round <span className="text-indigo-900">Count.</span>
               </h2>
               <p className="text-2xl md:text-3xl text-indigo-100 font-medium max-w-2xl mx-auto">
                 Join thousands of golfers winning prizes and supporting charity every single month.
               </p>
               <div className="pt-8">
                 <Button size="lg" className="rounded-full h-24 px-16 text-3xl font-black bg-white text-primary hover:bg-indigo-50 shadow-2xl transition-transform hover:scale-105">
                   Get Started Today
                 </Button>
               </div>
             </div>
          </div>
        </div>
      </section>
    </main>
  )
}
