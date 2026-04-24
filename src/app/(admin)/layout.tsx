import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/layout/AppSidebar"
import SignOutButton from "@/components/auth/SignOutButton"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') redirect("/")

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Sidebar */}
      <AppSidebar 
        variant="admin" 
        user={{
          email: session.user.email!,
          name: session.user.name!
        }} 
      />

      {/* Admin Header */}
      <header className="fixed top-0 left-[240px] right-0 h-20 border-b border-border bg-card/50 backdrop-blur-md z-30 hidden md:flex items-center justify-between px-10">
        <div>
          <h2 className="text-xl font-black text-foreground">Admin Panel</h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm font-black text-foreground">{session.user.email}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Administrator</p>
          </div>
          <SignOutButton variant="outline" className="rounded-full font-bold border-border hover:bg-destructive/10 hover:text-destructive" />
        </div>
      </header>

      {/* Main Content */}
      <main className="md:ml-[240px] pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 md:px-10 md:py-10 min-w-0">
          {children}
        </div>
      </main>
    </div>
  )
}
