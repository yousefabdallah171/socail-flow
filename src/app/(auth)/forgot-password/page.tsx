"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const { resetPassword } = await import('@/lib/auth/actions')
      const result = await resetPassword(email)

      if (result.error) {
        // Show error in a better way (you can enhance this with a toast or error state)
        console.error('Password reset error:', result.error)
        alert(result.error) // For now, keeping alert but you can improve this
      } else if (result.success) {
        setIsEmailSent(true)
      }
    } catch (error) {
      console.error('Password reset error:', error)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="animate-fade-in">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-secondary" />
            </div>
            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
            <CardDescription>
              We've sent a password reset link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 text-center">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                If you don't see the email in your inbox, please check your spam folder.
              </p>
              <p>
                The reset link will expire in 15 minutes for security reasons.
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              <Button
                onClick={() => window.open('https://gmail.com', '_blank')}
                className="w-full h-11"
              >
                Open Gmail
              </Button>
              
              <Button
                variant="outline"
                className="w-full h-11"
                onClick={() => {
                  setIsEmailSent(false)
                  setEmail("")
                }}
              >
                Try a different email
              </Button>
            </div>

            <div className="text-center text-sm">
              <Link
                href="/login"
                className="text-primary hover:text-primary/80 transition-colors font-medium inline-flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">Forgot your password?</CardTitle>
          <CardDescription>
            No worries! Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  className="pl-10 h-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This should be the email address associated with your SocialFlow account
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending reset link...
                </div>
              ) : (
                <div className="flex items-center">
                  Send reset link
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="text-center text-sm space-y-3">
            <div className="text-muted-foreground">
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Sign in
              </Link>
            </div>
            
            <div className="text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Create a free account
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}