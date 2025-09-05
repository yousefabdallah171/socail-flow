import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/actions'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, error } = await getUser()
  
  if (error || !user) {
    redirect('/login')
  }

  // Safe user data for client components
  const safeUser = {
    id: user.id || '',
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    avatar_url: user.user_metadata?.avatar_url || null,
    organization: user.user_metadata?.organization || 'My Organization'
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader user={safeUser} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}