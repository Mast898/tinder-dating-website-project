'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Heart, MessageCircle, Star, Sparkles, Clock } from 'lucide-react'
import Link from 'next/link'
import BottomNav from '@/components/bottom-nav'

interface Match {
  id: string
  matched_user_id: string
  created_at: string
  seen: boolean
  profile: {
    id: string
    name: string
    age: number
    photo_url: string
    bio: string
  }
}

interface NewMatch {
  id: string
  name: string
  age: number
  photo_url: string
  matched_at: string
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [newMatches, setNewMatches] = useState<NewMatch[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadMatches()
    
    // Подписка на новые матчи в реальном времени
    const channel = supabase
      .channel('matches-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches'
        },
        () => {
          loadMatches()
          // Вибрация при новом матче
          if (navigator.vibrate) navigator.vibrate([10, 5, 10])
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const loadMatches = async () => {
    try {
      const {  { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Загружаем принятые матчи
      const {  accepted } = await supabase
        .from('matches')
        .select(`
          *,
          profile:profiles!matched_user_id (
            id,
            name,
            age,
            photo_url,
            bio
          )
        `)
        .eq('user_id', user.id)
        .eq('accepted', true)
        .order('created_at', { ascending: false })

      // Загружаем новые (непросмотренные) матчи
      const {  pending } = await supabase
        .from('matches')
        .select(`
          *,
          profile:profiles!matched_user_id (
            id,
            name,
            age,
            photo_url
          )
        `)
        .eq('user_id', user.id)
        .eq('seen', false)
        .eq('accepted', null)
        .order('created_at', { ascending: false })

      setMatches(accepted || [])
      setNewMatches(pending?.map(m => ({
        id: m.profile.id,
        name: m.profile.name,
        age: m.profile.age,
        photo_url: m.profile.photo_url,
        matched_at: m.created_at
      })) || [])

      // Помечаем новые как просмотренные
      if (pending?.length) {
        await supabase
          .from('matches')
          .update({ seen: true })
          .eq('user_id', user.id)
          .in('id', pending.map(m => m.id))
      }
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptMatch = async (matchId: string) => {
    try {
      const {  { user } } = await supabase.auth.getUser()
      await supabase
        .from('matches')
        .update({ accepted: true })
        .eq('id', matchId)
        .eq('user_id', user?.id)
      
      loadMatches()
      
      // Вибрация успеха
      if (navigator.vibrate) navigator.vibrate([10, 5, 10])
    } catch (error) {
      console.error('Error accepting match:', error)
    }
  }

  const handleDeclineMatch = async (matchId: string) => {
    try {
      const {  { user } } = await supabase.auth.getUser()
      await supabase
        .from('matches')
        .update({ accepted: false })
        .eq('id', matchId)
        .eq('user_id', user?.id)
      
      loadMatches()
    } catch (error) {
      console.error('Error declining match:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FDF8F5] via-white to-[#F5F0EC]">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8B1E3F] to-[#D4A574] rounded-full blur-lg opacity-50 animate-pulse" />
            <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8B1E3F] to-[#D4A574] rounded-full">
              <Heart className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>
          <p className="text-[#6B7280] font-medium">Загрузка матчей...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-[#FDF8F5] via-white to-[#F5F0EC]">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-[#E5E7EB] px-6 py-4 z-10">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#8B1E3F] to-[#D4A574] bg-clip-text text-transparent">
            Матчи
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-8">
        
        {/* 🆕 Новые матчи */}
        {newMatches.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#D4A574]" />
              <h2 className="text-lg font-semibold text-[#1A1A2E]">
                Новые совпадения
              </h2>
              <span className="px-2 py-0.5 bg-gradient-to-r from-[#8B1E3F] to-[#D4A574] text-white text-xs font-bold rounded-full">
                {newMatches.length}
              </span>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {newMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex-shrink-0 w-32 text-center group"
                >
                  <div className="relative mb-3">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#8B1E3F] to-[#D4A574] rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative w-28 h-36 bg-gradient-to-br from-[#E5E7EB] to-[#D1D5DB] rounded-2xl overflow-hidden shadow-lg">
                      {match.photo_url ? (
                        <img
                          src={match.photo_url}
                          alt={match.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Heart className="w-10 h-10 text-[#9CA3AF]" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      <button
                        onClick={() => handleDeclineMatch(match.id)}
                        className="w-8 h-8 bg-white border-2 border-red-400 text-red-400 rounded-full shadow-lg hover:bg-red-50 transition-colors flex items-center justify-center"
                      >
                        <span className="text-lg font-bold">×</span>
                      </button>
                      <button
                        onClick={() => handleAcceptMatch(match.id)}
                        className="w-8 h-8 bg-gradient-to-br from-[#8B1E3F] to-[#D4A574] text-white rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="font-semibold text-[#1A1A2E] text-sm">
                    {match.name}, {match.age}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 💬 Ваши матчи */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-[#8B1E3F]" />
            <h2 className="text-lg font-semibold text-[#1A1A2E]">
              Ваши матчи
            </h2>
          </div>

          {matches.length > 0 ? (
            <div className="space-y-3">
              {matches.map((match) => (
                <Link
                  key={match.id}
                  href={`/chat/${match.matched_user_id}`}
                  className="block bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all border border-white/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#E5E7EB] to-[#D1D5DB] rounded-full overflow-hidden">
                        {match.profile?.photo_url ? (
                          <img
                            src={match.profile.photo_url}
                            alt={match.profile?.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Heart className="w-8 h-8 text-[#9CA3AF]" />
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[#1A1A2E]">
                          {match.profile?.name}
                        </h3>
                        {match.profile?.age && (
                          <span className="text-[#6B7280] text-sm">
                            {match.profile.age}
                          </span>
                        )}
                      </div>
                      
                      {match.profile?.bio && (
                        <p className="text-sm text-[#6B7280] line-clamp-1">
                          {match.profile.bio}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-1 mt-2 text-xs text-[#9CA3AF]">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(match.created_at).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <MessageCircle className="w-5 h-5 text-[#8B1E3F]" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-[#8B1E3F]/10 rounded-full blur-xl" />
                <div className="relative flex items-center justify-center w-20 h-20 bg-[#F9FAFB] rounded-full mx-auto">
                  <Heart className="w-10 h-10 text-[#8B1E3F]" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2">
                Пока нет матчей
              </h3>
              <p className="text-[#6B7280] text-sm mb-4">
                Продолжайте свайпать — ваш идеальный матч уже близко!
              </p>
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8B1E3F] to-[#D4A574] text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <Star className="w-4 h-4" />
                Найти кого-то
              </Link>
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </div>
  )
}