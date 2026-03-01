import { MatchesList } from '@/components/matches-list'
import { Heart } from 'lucide-react'

export default function MatchesPage() {
  return (
    <div className="flex flex-col">
      <header className="flex items-center justify-center gap-2 py-4 px-4">
        <Heart className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-bold text-foreground tracking-tight">Matches</h1>
      </header>
      <MatchesList />
    </div>
  )
}
