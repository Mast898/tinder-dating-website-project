import { DiscoverFeed } from '@/components/discover-feed'
import { Flame } from 'lucide-react'

export default function DiscoverPage() {
  return (
    <div className="flex flex-col h-[calc(100svh-5rem)]">
      <header className="flex items-center justify-center gap-2 py-4 px-4">
        <Flame className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-bold text-foreground tracking-tight">Discover</h1>
      </header>
      <div className="flex-1 px-4 pb-4">
        <DiscoverFeed />
      </div>
    </div>
  )
}
