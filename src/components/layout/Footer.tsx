"use client";

import Link from "next/link";
import { Heart, ShieldCheck } from "lucide-react";

export function Footer(): React.ReactElement {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-24 border-t border-border bg-card">
      <div className="container max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-20">
          <div className="space-y-6 max-w-sm">
            <Link href="/" className="text-3xl font-black tracking-tighter text-foreground">
              Golf<span className="text-primary">Draw</span>
            </Link>
            <p className="text-muted-foreground font-medium leading-relaxed">
              Empowering the golf community to give back through the data they already generate. Play more, win more, give more.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-20 gap-y-12">
            <div className="space-y-6">
              <p className="text-xs font-black uppercase tracking-widest text-foreground">Platform</p>
              <nav className="flex flex-col gap-4">
                <Link href="/#how-it-works" className="text-sm font-bold text-muted-foreground hover:text-primary">How It Works</Link>
                <Link href="/pricing" className="text-sm font-bold text-muted-foreground hover:text-primary">Pricing</Link>
                <Link href="/charities" className="text-sm font-bold text-muted-foreground hover:text-primary">Charities</Link>
              </nav>
            </div>
            <div className="space-y-6">
              <p className="text-xs font-black uppercase tracking-widest text-foreground">Account</p>
              <nav className="flex flex-col gap-4">
                <Link href="/login" className="text-sm font-bold text-muted-foreground hover:text-primary">Sign In</Link>
                <Link href="/signup" className="text-sm font-bold text-muted-foreground hover:text-primary">Create Account</Link>
                <Link href="/dashboard" className="text-sm font-bold text-muted-foreground hover:text-primary">Dashboard</Link>
              </nav>
            </div>
            <div className="space-y-6">
              <p className="text-xs font-black uppercase tracking-widest text-foreground">Company</p>
              <nav className="flex flex-col gap-4">
                <Link href="/terms" className="text-sm font-bold text-muted-foreground hover:text-primary">Terms</Link>
                <Link href="/privacy" className="text-sm font-bold text-muted-foreground hover:text-primary">Privacy</Link>
              </nav>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-12 border-t border-border">
          <p className="text-sm font-bold text-muted-foreground">© {currentYear} GolfDraw. Built for golfers by golfers.</p>
          <div className="flex items-center gap-6 text-muted-foreground">
             <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                <ShieldCheck size={16} className="text-primary" /> SECURE PAYMENTS
             </div>
             <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                <Heart size={16} className="text-red-500" /> 10% DONATION
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
