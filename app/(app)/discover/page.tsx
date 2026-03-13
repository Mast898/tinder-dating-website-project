import { DiscoverFeed } from '@/components/discover-feed'
import { Flame } from 'lucide-react'

export default function DiscoverPage() {
  return (
    <div className="flex flex-col h-[calc(100svh-5rem)] bg-gradient-to-br from-[#FDF8F5] via-white to-[#F5F0EC]">
      <header className="flex items-center justify-center gap-2 py-4 px-4 bg-white/80 backdrop-blur-xl border-b border-[#E5E7EB] sticky top-0 z-10">
        <Flame className="w-6 h-6 text-[#8B1E3F]" />
        <h1 className="text-xl font-bold bg-gradient-to-r from-[#8B1E3F] to-[#D4A574] bg-clip-text text-transparent">
          Поиск
        </h1>
      </header>
      <div className="flex-1 px-4 pb-4">
        <DiscoverFeed />
      </div>
    </div>
  )
}