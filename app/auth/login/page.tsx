"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, Wifi, WifiOff, Info } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login, offlineMode } = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email || !password) {
      setError("Email and password are required")
      return
    }

    try {
      setError("")
      setLoading(true)
      console.log("Attempting login...")
      await login(email, password)
      console.log("Login successful, redirecting...")
      router.push("/")
    } catch (err) {
      console.error("Login error:", err)
      setError("Login failed. The app is now running in offline mode.")
    } finally {
      setLoading(false)
    }
  }

  function handleDemoLogin() {
    setEmail("demo@example.com")
    setPassword("password123")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              {offlineMode ? (
                <>
                  <WifiOff className="h-4 w-4" />
                  <span>Offline</span>
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4" />
                  <span>Online</span>
                </>
              )}
            </div>
          </div>
          <CardDescription className="text-center">
            {offlineMode
              ? "Running in offline mode - your data will be saved locally"
              : "Enter your credentials to access your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {offlineMode && (
            <Alert className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <Info className="h-4 w-4" />
              <AlertDescription>
                You're in offline mode. You can still use the app, but data won't sync until you're back online.
              </AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
              {!offlineMode && (
                <div className="text-right text-sm">
                  <Link href="/auth/forgot-password" className="text-blue-600 hover:underline dark:text-blue-400">
                    Forgot password?
                  </Link>
                </div>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </Button>
          </form>

          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              Use Demo Account
            </Button>
          </div>

          {offlineMode && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                <strong>Offline Mode:</strong> You can use any email and password to create a local account.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-blue-600 hover:underline dark:text-blue-400">
              Sign Up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
