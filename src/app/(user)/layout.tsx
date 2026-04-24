import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { BottomTabBar } from "@/components/layout/BottomTabBar"

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar - Desktop */}
        <AppSidebar 
          variant="user" 
          user={{
            email: session.user.email!,
            name: session.user.name!
          }} 
        />
        
        {/* Main Content */}
        <main className="flex-1 md:ml-[240px] px-6 py-8 md:px-10 md:py-10 pb-32 md:pb-10 min-w-0">
          {children}
        </main>
      </div>

      {/* Bottom Tab Bar - Mobile */}
      <BottomTabBar />
    </div>
  )
}
