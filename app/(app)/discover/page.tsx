'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Flame, MapPin, Heart, X, Undo, Sparkles } from 'lucide-react'
import BottomNav from '@/components/bottom-nav'

interface Profile {
  id: string
  user_id: string
  full_name: string
  age: number
  bio: string
  photo_url: string
  city: string
  distance?: number
}

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    try {
      const {  { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id)
        .limit(10)

      if (error) throw error
      setProfiles(data || [])
    } catch (error) {
      console.error('Error loading profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (currentIndex >= profiles.length) return

    const profile = profiles[currentIndex]
    setSwipeDirection(direction)

    // Simulate swipe animation
    setTimeout(async () => {
      try {
        const {  { user } } = await supabase.auth.getUser()
        
        if (direction === 'right' && user) {
          // Create like record
          await supabase.from('likes').insert([
            { liker_id: user.id, liked_id: profile.user_id }
          ])

          // Check for match
          const { data: match } = await supabase
            .from('likes')
            .select('*')
            .eq('liker_id', profile.user_id)
            .eq('liked_id', user.id)
            .single()

          if (match) {
            // It's a match! Create match record
            await supabase.from('matches').insert([
              { user1_id: user.id, user2_id: profile.user_id }
            ])
            
            // Show match notification (you can add a modal here)
            console.log('🎉 It\'s a match!')
          }
        }

        setCurrentIndex(prev => prev + 1)
        setSwipeDirection(null)
      } catch (error) {
        console.error('Error handling swipe:', error)
        setSwipeDirection(null)
      }
    }, 300)
  }

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setSwipeDirection(null)
    }
  }

  const currentProfile = profiles[currentIndex]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FDF8F5] via-white to-[#F5F0EC]">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8B1E3F] to-[#D4A574] rounded-full blur-lg opacity-50 animate-pulse" />
            <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8B1E3F] to-[#D4A574] rounded-full">
              <Flame className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>
          <p className="text-[#6B7280] font-medium">Загрузка профилей...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDF8F5] via-white to-[#F5F0EC] pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-[#E5E7EB]/50 px-6 py-4 z-20">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#8B1E3F] to-[#D4A574] rounded-xl">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#8B1E3F] to-[#D4A574] bg-clip-text text-transparent">
              Поиск
            </h1>
          </div>
          <button className="p-2 hover:bg-[#F9FAFB] rounded-xl transition-colors">
            <Sparkles className="w-5 h-5 text-[#8B1E3F]" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {currentProfile ? (
          <>
            {/* Profile Card */}
            <div className="relative mb-6">
              <div
                className={`bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/50 transition-all duration-300 ${
                  swipeDirection === 'left' ? '-translate-x-full rotate-[-20deg] opacity-0' :
                  swipeDirection === 'right' ? 'translate-x-full rotate-[20deg] opacity-0' : ''
                }`}
              >
                {/* Photo */}
                <div className="relative h-[400px] bg-gradient-to-br from-[#E5E7EB] to-[#D1D5DB]">
                  {currentProfile.photo_url ? (
                    <img
                      src={currentProfile.photo_url}
                      alt={currentProfile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-[#8B1E3F]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Flame className="w-10 h-10 text-[#8B1E3F]" />
                        </div>
                        <p className="text-[#6B7280] text-sm">Нет фото</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Like/Nope Stamps */}
                  {swipeDirection === 'right' && (
                    <div className="absolute top-6 left-6 border-4 border-green-500 rounded-lg px-4 py-2 -rotate-12 bg-green-500/20 backdrop-blur-sm">
                      <span className="text-green-400 text-2xl font-extrabold">LIKE</span>
                    </div>
                  )}
                  {swipeDirection === 'left' && (
                    <div className="absolute top-6 right-6 border-4 border-red-500 rounded-lg px-4 py-2 rotate-12 bg-red-500/20 backdrop-blur-sm">
                      <span className="text-red-400 text-2xl font-extrabold">NOPE</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-2xl font-bold text-[#1A1A2E]">
                      {currentProfile.full_name}
                    </h2>
                    <span className="text-xl text-[#6B7280]">
                      {currentProfile.age}
                    </span>
                  </div>
                  
                  {currentProfile.city && (
                    <div className="flex items-center gap-2 text-[#6B7280] mb-4">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{currentProfile.city}</span>
                      {currentProfile.distance && (
                        <span className="text-xs bg-[#F9FAFB] px-2 py-1 rounded-full">
                          {currentProfile.distance} км
                        </span>
                      )}
                    </div>
                  )}
                  
                  {currentProfile.bio && (
                    <p className="text-[#6B7280] leading-relaxed line-clamp-3">
                      {currentProfile.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              {/* Undo */}
              <button
                onClick={handleUndo}
                disabled={currentIndex === 0}
                className="flex items-center justify-center w-14 h-14 bg-white border-2 border-[#E5E7EB] text-[#9CA3AF] rounded-full shadow-lg hover:shadow-xl hover:scale-110 hover:border-[#D4A574] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Undo className="w-6 h-6" />
              </button>

              {/* Nope */}
              <button
                onClick={() => handleSwipe('left')}
                className="flex items-center justify-center w-16 h-16 bg-white border-2 border-red-400 text-red-500 rounded-full shadow-lg hover:shadow-xl hover:scale-110 hover:bg-red-500 hover:text-white transition-all"
              >
                <X className="w-7 h-7" />
              </button>

              {/* Like */}
              <button
                onClick={() => handleSwipe('right')}
                className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8B1E3F] to-[#D4A574] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all"
              >
                <Heart className="w-7 h-7" />
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {profiles.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index < currentIndex 
                      ? 'w-6 bg-[#8B1E3F]' 
                      : index === currentIndex 
                        ? 'w-6 bg-[#D4A574]' 
                        : 'w-2 bg-[#E5E7EB]'
                  }`}
                />
              ))}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[#8B1E3F]/10 rounded-full blur-xl" />
              <div className="relative flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#8B1E3F]/10 to-[#D4A574]/10 rounded-full">
                <Flame className="w-12 h-12 text-[#8B1E3F]" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">
              Больше нет профилей
            </h2>
            <p className="text-[#6B7280] mb-6 max-w-xs">
              Загляните позже — рядом могут появиться новые люди
            </p>
            <button
              onClick={loadProfiles}
              className="px-6 py-3 bg-gradient-to-r from-[#8B1E3F] to-[#D4A574] text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              Обновить
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}