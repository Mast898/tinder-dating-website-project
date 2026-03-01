'use client'

import { createClient } from '@/lib/supabase/client'
import { MessageCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import useSWR from 'swr'

interface ChatPreview {
  matchId: string
  partner: {
    id: string
    name: string
    photo_url: string
  }
  lastMessage: string | null
  lastMessageAt: string | null
}

async function fetchChats(): Promise<ChatPreview[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (!matches || matches.length === 0) return []

  const partnerIds = matches.map((m) =>
    m.user1_id === user.id ? m.user2_id : m.user1_id
  )

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, photo_url')
    .in('id', partnerIds)

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) || [])

  // Get last message per match
  const chats: ChatPreview[] = []

  for (const match of matches) {
    const partnerId = match.user1_id === user.id ? match.user2_id : match.user1_id
    const partner = profileMap.get(partnerId) || { id: partnerId, name: 'Unknown', photo_url: '' }

    const { data: lastMsg } = await supabase
      .from('messages')
      .select('content, created_at')
      .eq('match_id', match.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    chats.push({
      matchId: match.id,
      partner,
      lastMessage: lastMsg?.content || null,
      lastMessageAt: lastMsg?.created_at || match.created_at,
    })
  }

  return chats.sort((a, b) => {
    const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
    const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
    return dateB - dateA
  })
}

export function ChatList() {
  const { data: chats, isLoading } = useSWR('chat-list', fetchChats, { refreshInterval: 5000 })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!chats || chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-secondary">
          <MessageCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-semibold text-foreground">No conversations</p>
        <p className="text-sm text-muted-foreground">Match with someone to start chatting</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 px-4">
      {chats.map((chat) => (
        <Link
          key={chat.matchId}
          href={`/chat/${chat.matchId}`}
          className="flex items-center gap-3 p-3 rounded-2xl hover:bg-secondary/50 transition-colors"
        >
          {chat.partner.photo_url ? (
            <img
              src={chat.partner.photo_url}
              alt={`${chat.partner.name}'s photo`}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-lg font-bold text-muted-foreground">
                {chat.partner.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground">{chat.partner.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {chat.lastMessage || 'Say hello!'}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
