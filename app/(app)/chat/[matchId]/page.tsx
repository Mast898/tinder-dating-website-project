'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { Send, ArrowLeft, MoreVertical, Heart, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import BottomNav from '@/components/bottom-nav'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  sender_id: string
  content: string
  created_at: string
  read: boolean
}

interface Profile {
  id: string
  name: string
  age: number
  photo_url: string
  bio: string
  online: boolean
}

export default function ChatPage() {
  const params = useParams()
  const matchId = params.matchId as string
  const router = useRouter()
  const supabase = createClient()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeChat()
    
    // Подписка на новые сообщения
    const channel = supabase
      .channel(`chat-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => [...prev, newMsg])
          
          // Вибрация при новом сообщении
          if (navigator.vibrate) navigator.vibrate([10])
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [matchId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeChat = async () => {
    try {
      const {  { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      setCurrentUserId(user.id)

      // Получаем информацию о матче
      const {  match } = await supabase
        .from('matches')
        .select('user1_id, user2_id')
        .eq('id', matchId)
        .single()

      if (!match) {
        router.push('/chat')
        return
      }

      const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id

      // Получаем профиль собеседника
      const {  profileData } = await supabase
        .from('profiles')
        .select('id, name, age, photo_url, bio')
        .eq('id', otherUserId)
        .single()

      setProfile(profileData)

      // Получаем сообщения
      const {  messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true })

      setMessages(messagesData || [])

      // Помечаем сообщения как прочитанные
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('match_id', matchId)
        .eq('receiver_id', user.id)
        .eq('read', false)
    } catch (error) {
      console.error('Error initializing chat:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId) return

    try {
      const {  { user } } = await supabase.auth.getUser()
      
      const {  match } = await supabase
        .from('matches')
        .select('user1_id, user2_id')
        .eq('id', matchId)
        .single()

      const receiverId = match.user1_id === user?.id ? match.user2_id : match.user1_id

      await supabase.from('messages').insert({
        match_id: matchId,
        sender_id: user?.id,
        receiver_id: receiverId,
        content: newMessage.trim(),
        read: false
      })

      setNewMessage('')
      
      // Вибрация при отправке
      if (navigator.vibrate) navigator.vibrate([5])
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

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
          <p className="text-[#6B7280] font-medium">Загрузка чата...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-[#FDF8F5] via-white to-[#F5F0EC] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-[#E5E7EB] px-4 py-3 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link
            href="/chat"
            className="p-2 hover:bg-[#F9FAFB] rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#1A1A2E]" />
          </Link>
          
          {profile && (
            <>
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-[#E5E7EB] to-[#D1D5DB] rounded-full overflow-hidden">
                  {profile.photo_url ? (
                    <img
                      src={profile.photo_url}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Heart className="w-5 h-5 text-[#9CA3AF]" />
                    </div>
                  )}
                </div>
                {profile.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              
              <div className="flex-1">
                <h2 className="font-semibold text-[#1A1A2E]">
                  {profile.name}{profile.age ? `, ${profile.age}` : ''}
                </h2>
                <p className="text-xs text-[#9CA3AF]">
                  {profile.online ? 'онлайн' : 'был(а) недавно'}
                </p>
              </div>
            </>
          )}
          
          <button className="p-2 hover:bg-[#F9FAFB] rounded-xl transition-colors">
            <MoreVertical className="w-5 h-5 text-[#1A1A2E]" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-lg mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => {
              const isOwn = message.sender_id === currentUserId
              const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  {showAvatar && !isOwn && profile ? (
                    <div className="w-8 h-8 bg-gradient-to-br from-[#E5E7EB] to-[#D1D5DB] rounded-full overflow-hidden flex-shrink-0">
                      {profile.photo_url ? (
                        <img
                          src={profile.photo_url}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Heart className="w-4 h-4 text-[#9CA3AF]" />
                        </div>
                      )}
                    </div>
                  ) : !isOwn ? (
                    <div className="w-8 flex-shrink-0" />
                  ) : null}

                  {/* Message bubble */}
                  <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl ${
                        isOwn
                          ? 'bg-gradient-to-r from-[#8B1E3F] to-[#D4A574] text-white rounded-br-md'
                          : 'bg-white/80 backdrop-blur-xl border border-[#E5E7EB] text-[#1A1A2E] rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                    
                    <span className="text-xs text-[#9CA3AF] mt-1 px-1">
                      {new Date(message.created_at).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t border-[#E5E7EB] px-4 py-3">
        <div className="max-w-lg mx-auto flex items-end gap-2">
          <button className="p-3 hover:bg-[#F9FAFB] rounded-xl transition-colors">
            <ImageIcon className="w-5 h-5 text-[#9CA3AF]" />
          </button>
          
          <div className="flex-1 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] focus-within:border-[#8B1E3F] focus-within:ring-2 focus-within:ring-[#8B1E3F]/20 transition-all">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Напишите сообщение..."
              rows={1}
              className="w-full px-4 py-3 bg-transparent resize-none outline-none text-[#1A1A2E] placeholder:text-[#9CA3AF] max-h-32"
              style={{ minHeight: '48px' }}
            />
          </div>
          
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="p-3 bg-gradient-to-r from-[#8B1E3F] to-[#D4A574] text-white rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}