"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// !!!!! DEVELOPMENT TESTING PAGE !!!!!
// !!!!! REMOVE THIS ENTIRE FILE IN PRODUCTION !!!!!

export default function DevTestPage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [testEmail, setTestEmail] = useState("test@example.com")
  const [testPassword, setTestPassword] = useState("password123")

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    setIsLoading(true)
    setTestResults(null)
    
    try {
      console.log(`🧪 DEV: Running test: ${testName}`)
      const result = await testFunction()
      setTestResults({ testName, result, success: true })
      console.log(`✅ DEV: Test ${testName} completed:`, result)
    } catch (error) {
      setTestResults({ testName, result: error, success: false })
      console.error(`❌ DEV: Test ${testName} failed:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  const testRegistration = async () => {
    const { signUp } = await import('@/lib/auth/actions')
    return await signUp({
      email: testEmail,
      password: testPassword,
      firstName: "Test",
      lastName: "User"
    })
  }

  const testLogin = async () => {
    const { signIn } = await import('@/lib/auth/actions')
    return await signIn({
      email: testEmail,
      password: testPassword
    })
  }

  const testGetUser = async () => {
    const { getUser } = await import('@/lib/auth/actions')
    return await getUser()
  }

  const testDebugInfo = async () => {
    const { devGetUserDebugInfo } = await import('@/lib/auth/actions')
    return await devGetUserDebugInfo()
  }

  const testClearData = async () => {
    const { devClearUserData } = await import('@/lib/auth/actions')
    return await devClearUserData()
  }

  const testSignOut = async () => {
    const { signOut } = await import('@/lib/auth/actions')
    return await signOut()
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">🧪 Development Testing Page</h1>
          <p className="text-muted-foreground mb-4">
            Test all authentication functions with detailed logging
          </p>
          <Badge variant="destructive" className="mb-8">
            ⚠️ REMOVE THIS PAGE IN PRODUCTION
          </Badge>
        </div>

        {/* Test Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>
              Configure test credentials for authentication testing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="testEmail">Test Email</Label>
                <Input
                  id="testEmail"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <div>
                <Label htmlFor="testPassword">Test Password</Label>
                <Input
                  id="testPassword"
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="password123"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Button
            onClick={() => runTest("Registration", testRegistration)}
            disabled={isLoading}
            className="h-20"
          >
            <div className="text-center">
              <div className="text-2xl mb-1">📝</div>
              <div className="text-sm">Test Registration</div>
            </div>
          </Button>

          <Button
            onClick={() => runTest("Login", testLogin)}
            disabled={isLoading}
            className="h-20"
          >
            <div className="text-center">
              <div className="text-2xl mb-1">🔐</div>
              <div className="text-sm">Test Login</div>
            </div>
          </Button>

          <Button
            onClick={() => runTest("Get User", testGetUser)}
            disabled={isLoading}
            className="h-20"
          >
            <div className="text-center">
              <div className="text-2xl mb-1">👤</div>
              <div className="text-sm">Get User Data</div>
            </div>
          </Button>

          <Button
            onClick={() => runTest("Debug Info", testDebugInfo)}
            disabled={isLoading}
            className="h-20"
          >
            <div className="text-center">
              <div className="text-2xl mb-1">🔍</div>
              <div className="text-sm">Debug Info</div>
            </div>
          </Button>

          <Button
            onClick={() => runTest("Clear Data", testClearData)}
            disabled={isLoading}
            className="h-20"
            variant="destructive"
          >
            <div className="text-center">
              <div className="text-2xl mb-1">🧹</div>
              <div className="text-sm">Clear User Data</div>
            </div>
          </Button>

          <Button
            onClick={() => runTest("Sign Out", testSignOut)}
            disabled={isLoading}
            className="h-20"
            variant="outline"
          >
            <div className="text-center">
              <div className="text-2xl mb-1">🚪</div>
              <div className="text-sm">Sign Out</div>
            </div>
          </Button>
        </div>

        {/* Test Results */}
        {testResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {testResults.success ? "✅" : "❌"} Test Results: {testResults.testName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(testResults.result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">1. Test Registration Flow:</h4>
              <p className="text-sm text-muted-foreground">
                Click "Test Registration" to create a new user account. Check console for detailed logs.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">2. Test Login Flow:</h4>
              <p className="text-sm text-muted-foreground">
                Click "Test Login" to authenticate the user. Should redirect to dashboard.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">3. Test User Data:</h4>
              <p className="text-sm text-muted-foreground">
                Click "Get User Data" to see current user information and organization data.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">4. Debug Issues:</h4>
              <p className="text-sm text-muted-foreground">
                Click "Debug Info" to see detailed information about user state and any errors.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">5. Reset for Testing:</h4>
              <p className="text-sm text-muted-foreground">
                Click "Clear User Data" to remove all user data and start fresh testing.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Console Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>🖥️ Console Logging</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              All authentication functions now include detailed console logging with emojis:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>🚀 Registration process steps</li>
              <li>🔐 Login process steps</li>
              <li>👤 User data retrieval</li>
              <li>🏢 Organization creation</li>
              <li>✅ Success messages</li>
              <li>❌ Error messages</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              Open your browser's Developer Tools (F12) and check the Console tab to see detailed logs.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
