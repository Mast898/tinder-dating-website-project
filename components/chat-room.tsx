'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import useSWR from 'swr'

interface Message {
  id: string
  match_id: string
  sender_id: string
  content: string
  created_at: string
}

interface Partner {
  id: string
  name: string
  photo_url: string
}

interface ChatRoomProps {
  matchId: string
}

async function fetchMessages(matchId: string): Promise<Message[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true })

  if (error) return []
  return data || []
}

async function fetchPartner(matchId: string): Promise<Partner | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single()

  if (!match) return null

  const partnerId = match.user1_id === user.id ? match.user2_id : match.user1_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, photo_url')
    .eq('id', partnerId)
    .single()

  return profile || null
}

export function ChatRoom({ matchId }: ChatRoomProps) {
  const { data: messages, mutate } = useSWR(
    `messages-${matchId}`,
    () => fetchMessages(matchId),
    { refreshInterval: 3000 }
  )
  const { data: partner } = useSWR(
    `partner-${matchId}`,
    () => fetchPartner(matchId)
  )

  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }
    getUser()
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Set up Supabase realtime subscription
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`messages:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        () => {
          mutate()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId, mutate])

  const handleSend = useCallback(async () => {
    if (!input.trim() || !userId) return
    setSending(true)

    const supabase = createClient()
    await supabase.from('messages').insert({
      match_id: matchId,
      sender_id: userId,
      content: input.trim(),
    })

    setInput('')
    setSending(false)
    mutate()
  }, [input, userId, matchId, mutate])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[100svh]">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <Link href="/chat" className="text-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-6 h-6" />
          <span className="sr-only">Back to chats</span>
        </Link>
        {partner ? (
          <div className="flex items-center gap-3">
            {partner.photo_url ? (
              <img
                src={partner.photo_url}
                alt={`${partner.name}'s photo`}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-sm font-bold text-muted-foreground">
                  {partner.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="font-semibold text-foreground">{partner.name}</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-secondary animate-pulse" />
            <div className="w-24 h-4 rounded bg-secondary animate-pulse" />
          </div>
        )}
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        {!messages ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center flex-1 text-muted-foreground text-sm">
            Say hello to start the conversation
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === userId
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-secondary text-secondary-foreground rounded-bl-md'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-card">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 h-11 rounded-xl bg-secondary text-secondary-foreground border-0 px-4"
          disabled={sending}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="w-11 h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Send className="w-5 h-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
      <div className="h-[env(safe-area-inset-bottom)] bg-card" />
    </div>
  )
}
