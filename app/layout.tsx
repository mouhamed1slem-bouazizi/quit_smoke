import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { NotificationProvider } from "@/contexts/notification-context"

export const metadata: Metadata = {
  title: "Quit Smoking App",
  description: "Your journey to a smoke-free life",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
