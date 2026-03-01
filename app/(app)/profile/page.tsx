import { ProfileEditor } from '@/components/profile-editor'
import { User } from 'lucide-react'

export default function ProfilePage() {
  return (
    <div className="flex flex-col">
      <header className="flex items-center justify-center gap-2 py-4 px-4">
        <User className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-bold text-foreground tracking-tight">Profile</h1>
      </header>
      <ProfileEditor />
    </div>
  )
}
