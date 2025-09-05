"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, User, Github, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
    marketingOptIn: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match")
      return
    }

    if (!formData.termsAccepted) {
      alert("Please accept the Terms of Service")
      return
    }

    setIsLoading(true)
    
    try {
      const { signUp } = await import('@/lib/auth/actions')
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      })

      if (result.success) {
        alert(result.message || 'Account created successfully!')
        // Redirect to dashboard
        window.location.href = '/dashboard'
      } else {
        alert(result.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('An unexpected error occurred during registration. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      const { signInWithOAuth } = await import('@/lib/auth/actions')
      const result = await signInWithOAuth(provider)
      
      if (result.error) {
        alert(result.error)
      }
    } catch (error) {
      console.error('Social login error:', error)
      alert('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <div className="animate-fade-in">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">
            Create your free account
          </CardTitle>
          <CardDescription>
            Start creating and managing your social media projects with AI
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Social Registration Buttons */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-11"
              onClick={() => handleSocialLogin("google")}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </Button>
            
            <Button
              variant="outline"
              className="w-full h-11"
              onClick={() => handleSocialLogin("github")}
            >
              <Github className="h-5 w-5 mr-2" />
              Sign up with GitHub
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    placeholder="John"
                    className="pl-10 h-11"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  className="h-11"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="pl-10 h-11"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="pl-10 pr-10 h-11"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters with letters and numbers
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="pl-10 pr-10 h-11"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {/* Terms and Marketing */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, termsAccepted: !!checked }))
                  }
                />
                <div className="text-sm">
                  <Label htmlFor="terms" className="text-sm font-normal">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="marketing"
                  checked={formData.marketingOptIn}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, marketingOptIn: !!checked }))
                  }
                />
                <div className="text-sm">
                  <Label htmlFor="marketing" className="text-sm font-normal text-muted-foreground">
                    Send me updates about SocialFlow features and tips
                  </Label>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Create account
                </div>
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}