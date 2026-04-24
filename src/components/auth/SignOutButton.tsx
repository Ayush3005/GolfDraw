"use client"
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { cn } from "@/lib/utils"

interface SignOutButtonProps {
  variant?: 'default' | 'ghost' | 'outline'
  showIcon?: boolean
  className?: string
}

export default function SignOutButton({ variant = 'ghost', showIcon = true, className }: SignOutButtonProps) {
  const handleSignOut = async () => {
    await signOut({ 
      callbackUrl: '/login',
      redirect: true 
    })
  }

  return (
    <Button variant={variant} onClick={handleSignOut} className={cn("gap-2 text-destructive hover:bg-destructive/10", className)}>
      {showIcon && <LogOut size={16} />}
      Sign Out
    </Button>
  )
}
