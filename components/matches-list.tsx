'use client'

import { createClient } from '@/lib/supabase/client'
import { Heart, Loader2, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import useSWR from 'swr'

interface Match {
  id: string
  user1_id: string
  user2_id: string
  created_at: string
  partner: {
    id: string
    name: string
    photo_url: string
    city: string
  }
}

async function fetchMatches(): Promise<Match[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (error || !matches) return []

  // Fetch partner profiles
  const partnerIds = matches.map((m) =>
    m.user1_id === user.id ? m.user2_id : m.user1_id
  )

  if (partnerIds.length === 0) return []

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, photo_url, city')
    .in('id', partnerIds)

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) || [])

  return matches.map((m) => {
    const partnerId = m.user1_id === user.id ? m.user2_id : m.user1_id
    return {
      ...m,
      partner: profileMap.get(partnerId) || {
        id: partnerId,
        name: 'Unknown',
        photo_url: '',
        city: '',
      },
    }
  })
}

export function MatchesList() {
  const { data: matches, isLoading } = useSWR('matches-list', fetchMatches)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-secondary">
          <Heart className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-semibold text-foreground">No matches yet</p>
        <p className="text-sm text-muted-foreground">Start swiping to find your matches</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 px-4">
      {matches.map((match) => (
        <Link
          key={match.id}
          href={`/chat/${match.id}`}
          className="flex items-center gap-4 p-3 rounded-2xl bg-card border border-border hover:bg-secondary/50 transition-colors"
        >
          {match.partner.photo_url ? (
            <img
              src={match.partner.photo_url}
              alt={`${match.partner.name}'s photo`}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-xl font-bold text-muted-foreground">
                {match.partner.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">{match.partner.name}</p>
            {match.partner.city && (
              <p className="text-xs text-muted-foreground truncate">{match.partner.city}</p>
            )}
          </div>
          <MessageCircle className="w-5 h-5 text-primary shrink-0" />
        </Link>
      ))}
    </div>
  )
}
