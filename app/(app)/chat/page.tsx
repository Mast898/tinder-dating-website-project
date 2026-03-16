'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { MessageCircle, Clock, Search, Sparkles } from 'lucide-react'
import Link from 'next/link'
import BottomNav from '@/components/bottom-nav'

interface Chat {
  id: string
  match_id: string
  user1_id: string
  user2_id: string
  last_message?: {
    id: string
    content: string
    created_at: string
    sender_id: string
    read: boolean
  }
  unread_count: number
  profile: {
    id: string
    name: string
    age: number
    photo_url: string
    online?: boolean
  }
}

export default function ChatListPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadChats()
    
    // Подписка на новые сообщения
    const channel = supabase
      .channel('chat-list-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          loadChats()
          if (navigator.vibrate) navigator.vibrate([15, 5, 15])
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const loadChats = async () => {
    try {
      // ✅ ИСПРАВЛЕНО: добавлено ``
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Получаем все матчи пользователя
      const { data: matches } = await supabase
        .from('matches')
        .select(`
          id,
          user1_id,
          user2_id,
          messages (
            id,
            content,
            created_at,
            sender_id,
            read
          )
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('accepted', true)
        .order('created_at', { ascending: false })

      // Форматируем чаты с последними сообщениями
      const formattedChats = await Promise.all(
        (matches || []).map(async (match) => {
          const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id
          
          // Получаем профиль собеседника
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, name, age, photo_url')
            .eq('id', otherUserId)
            .single()

          // Получаем последнее сообщение
          const messages = match.messages || []
          const lastMessage = messages.length > 0 ? messages[messages.length - 1] : undefined

          // Считаем непрочитанные
          const unread_count = messages.filter(
            (m: any) => m.sender_id === otherUserId && !m.read
          ).length

          return {
            id: match.id,
            match_id: match.id,
            user1_id: match.user1_id,
            user2_id: match.user2_id,
            last_message: lastMessage,
            unread_count,
            profile: profile || { id: otherUserId, name: 'Пользователь', age: 0, photo_url: '' }
          }
        })
      )

      setChats(formattedChats)
    } catch (error) {
      console.error('Error loading chats:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredChats = chats.filter((chat) =>
    chat.profile.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FDF8F5] via-white to-[#F5F0EC]">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8B1E3F] to-[#D4A574] rounded-full blur-lg opacity-50 animate-pulse" />
            <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8B1E3F] to-[#D4A574] rounded-full">
              <MessageCircle className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>
          <p className="text-[#6B7280] font-medium">Загрузка чатов...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-[#FDF8F5] via-white to-[#F5F0EC]">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-[#E5E7EB] px-6 py-4 z-10">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#8B1E3F] to-[#D4A574] bg-clip-text text-transparent mb-4">
            Сообщения
          </h1>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск чатов..."
              className="w-full pl-12 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#8B1E3F]/20 focus:border-[#8B1E3F] outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {filteredChats.length > 0 ? (
          <div className="space-y-3">
            {filteredChats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.match_id}`}
                className="block bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all border border-white/50 group"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#E5E7EB] to-[#D1D5DB] rounded-full overflow-hidden">
                      {chat.profile.photo_url ? (
                        <img
                          src={chat.profile.photo_url}
                          alt={chat.profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <MessageCircle className="w-7 h-7 text-[#9CA3AF]" />
                        </div>
                      )}
                    </div>
                    
                    {chat.profile.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[#1A1A2E]">
                          {chat.profile.name}
                        </h3>
                        {chat.profile.age && (
                          <span className="text-[#6B7280] text-sm">
                            {chat.profile.age}
                          </span>
                        )}
                      </div>
                      
                      {chat.last_message && (
                        <span className="text-xs text-[#9CA3AF]">
                          {new Date(chat.last_message.created_at).toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>

                    {chat.last_message ? (
                      <div className="flex items-center gap-2">
                        <p className={`text-sm truncate ${
                          !chat.last_message.read && chat.last_message.sender_id !== chat.profile.id
                            ? 'text-[#8B1E3F] font-semibold'
                            : 'text-[#6B7280]'
                        }`}>
                          {chat.last_message.sender_id === chat.profile.id && '📩 '}
                          {chat.last_message.content}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-[#9CA3AF]">Начните общение</p>
                    )}
                  </div>

                  {/* Unread badge */}
                  {chat.unread_count > 0 && (
                    <div className="flex-shrink-0">
                      <span className="flex items-center justify-center min-w-[22px] h-[22px] px-1.5 bg-gradient-to-r from-[#8B1E3F] to-[#D4A574] text-white text-xs font-bold rounded-full">
                        {chat.unread_count > 9 ? '9+' : chat.unread_count}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-[#8B1E3F]/10 rounded-full blur-xl" />
              <div className="relative flex items-center justify-center w-20 h-20 bg-[#F9FAFB] rounded-full mx-auto">
                <MessageCircle className="w-10 h-10 text-[#8B1E3F]" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2">
              {searchQuery ? 'Чаты не найдены' : 'Нет сообщений'}
            </h3>
            <p className="text-[#6B7280] text-sm mb-4">
              {searchQuery 
                ? 'Попробуйте изменить запрос'
                : 'Начните общение с вашим матчем'}
            </p>
            {!searchQuery && (
              <Link
                href="/matches"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8B1E3F] to-[#D4A574] text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Перейти к матчам
              </Link>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}