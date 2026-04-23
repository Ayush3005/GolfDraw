"use client"
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface SignOutButtonProps {
  variant?: 'default' | 'ghost' | 'outline'
  showIcon?: boolean
}

export default function SignOutButton({ variant = 'ghost', showIcon = true }: SignOutButtonProps) {
  const handleSignOut = async () => {
    await signOut({ 
      callbackUrl: '/login',
      redirect: true 
    })
  }

  return (
    <Button variant={variant} onClick={handleSignOut} className="gap-2 text-destructive hover:bg-destructive/10">
      {showIcon && <LogOut size={16} />}
      Sign Out
    </Button>
  )
}
