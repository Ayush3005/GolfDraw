"use client"

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DashboardLink() {
  const { data: session } = useSession()
  
  if (!session?.user) return null
  
  const href = session.user.role === 'admin' ? '/admin' : '/dashboard'
  
  return (
    <Link href={href}>
      <Button className="rounded-full px-6 font-bold bg-primary hover:bg-primary/90 text-white">
        {session.user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
      </Button>
    </Link>
  )
}
