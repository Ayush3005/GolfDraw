import { auth } from "@/lib/auth/config"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings as SettingsIcon, User, Bell, Shield, CreditCard } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default async function SettingsPage(props: { searchParams?: Promise<{ tab?: string }> }) {
  const session = await auth()
  const searchParams = await props.searchParams
  const activeTab = searchParams?.tab || "profile"

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Settings" 
        subtitle="Manage your account preferences and subscription."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <h3 className="text-lg font-bold">General</h3>
          <nav className="space-y-1">
            <Button variant="ghost" asChild className={cn("w-full justify-start gap-3 rounded-xl font-bold transition-all", activeTab === "profile" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              <Link href="/settings?tab=profile">
                <User size={18} /> Profile
              </Link>
            </Button>
            <Button variant="ghost" asChild className={cn("w-full justify-start gap-3 rounded-xl font-bold transition-all", activeTab === "subscription" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              <Link href="/settings?tab=subscription">
                <CreditCard size={18} /> Subscription
              </Link>
            </Button>
            <Button variant="ghost" asChild className={cn("w-full justify-start gap-3 rounded-xl font-bold transition-all", activeTab === "notifications" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              <Link href="/settings?tab=notifications">
                <Bell size={18} /> Notifications
              </Link>
            </Button>
            <Button variant="ghost" asChild className={cn("w-full justify-start gap-3 rounded-xl font-bold transition-all", activeTab === "security" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              <Link href="/settings?tab=security">
                <Shield size={18} /> Security
              </Link>
            </Button>
          </nav>
        </div>

        <div className="md:col-span-2">
          {activeTab === "profile" && (
            <Card className="border-border bg-card shadow-lg">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details and how others see you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-bold text-muted-foreground">Email Address</p>
                  <p className="text-lg font-black text-foreground">{session?.user?.email}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "subscription" && (
            <Card className="border-border bg-card shadow-lg">
              <CardHeader>
                <CardTitle>Subscription Management</CardTitle>
                <CardDescription>Manage your billing details, view invoices, or change your plan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-muted/30 rounded-2xl border border-border">
                  <h4 className="font-bold text-foreground mb-2">Billing Portal</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Access the secure Stripe billing portal to update your payment method, view past receipts, or cancel your subscription.
                  </p>
                  <Button asChild className="rounded-xl font-bold bg-foreground text-background hover:bg-foreground/90">
                    <a href="/api/stripe/portal">Manage Billing</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card className="border-border bg-card shadow-lg">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what updates you want to receive.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground italic">Notification settings coming soon.</p>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card className="border-border bg-card shadow-lg">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your password and account security.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground italic">Security settings are managed by your authentication provider.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
