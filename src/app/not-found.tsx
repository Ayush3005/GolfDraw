import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Home, LayoutDashboard } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 bg-white p-12 rounded-[40px] shadow-xl border border-slate-100">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-blue-100">
          <Search size={40} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">Page not found</h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved to a new location.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            size="lg" 
            className="rounded-full h-14 font-black bg-blue-600 hover:bg-blue-700 gap-2"
            asChild
          >
            <Link href="/dashboard">
              <LayoutDashboard size={18} /> Go to Dashboard
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            size="lg" 
            className="rounded-full h-14 font-black text-slate-600 gap-2"
            asChild
          >
            <Link href="/">
              <Home size={18} /> Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
