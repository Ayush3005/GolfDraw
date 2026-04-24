"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCcw, Home } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 bg-white p-12 rounded-[40px] shadow-xl border border-slate-100">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-red-100">
          <AlertCircle size={40} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">Something went wrong</h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            We encountered an unexpected error. Don&apos;t worry, your data is safe.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="p-4 bg-slate-50 rounded-2xl text-left overflow-auto max-h-40 border border-slate-200">
            <p className="text-xs font-mono text-red-600 break-words">{error.message}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button 
            onClick={reset}
            size="lg" 
            className="rounded-full h-14 font-black bg-slate-900 hover:bg-slate-800 gap-2"
          >
            <RefreshCcw size={18} /> Try again
          </Button>
          <Button 
            variant="ghost" 
            size="lg" 
            className="rounded-full h-14 font-black text-slate-600 gap-2"
            asChild
          >
            <Link href="/">
              <Home size={18} /> Go home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
