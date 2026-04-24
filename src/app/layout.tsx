import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "@/app/globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'GolfDraw | Play. Win. Give Back.',
    template: '%s | GolfDraw'
  },
  description: 'Monthly golf prize draws with charity giving built in.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "antialiased bg-background text-foreground min-h-screen")}>
        <Providers>
          {children}
          <Toaster 
            position="bottom-right" 
            expand={false} 
            richColors 
            theme="light"
            toastOptions={{
              className: 'rounded-2xl border-border bg-card font-sans font-bold',
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
