'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Flame, User, X, Heart, Star } from 'lucide-react'
import { SwipeCard } from '@/components/swipe-card'

interface Profile {
  id: string
  name: string
  age: number
  bio: string
  photo_url: string
  distance?: number
  interests?: string[]
}

export function DiscoverFeed() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
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

  const handleSwipe = async (liked: boolean) => {
    setDirection(liked ? 'right' : 'left')
    
    setTimeout(async () => {
      const currentProfile = profiles[currentIndex]
      
      if (liked && currentProfile) {
        const { data: { user } } = await supabase.auth.getUser()
        await supabase.from('likes').insert({
          user_id: user?.id,
          liked_user_id: currentProfile.id,
        })
      }
      
      setCurrentIndex(prev => prev + 1)
      setDirection(null)
    }, 300)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
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

  const currentProfile = profiles[currentIndex]

  if (!currentProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-[#8B1E3F]/10 rounded-full blur-xl" />
          <div className="relative flex items-center justify-center w-24 h-24 bg-[#F9FAFB] rounded-full">
            <Flame className="w-12 h-12 text-[#8B1E3F]" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[#1A1A2E] mb-3">
          Больше нет профилей
        </h2>
        <p className="text-[#6B7280] max-w-xs mb-6">
          Загляните позже — рядом могут появиться новые люди
        </p>
        
        <button
          onClick={loadProfiles}
          className="px-6 py-3 bg-gradient-to-r from-[#8B1E3F] to-[#D4A574] text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all"
        >
          Обновить
        </button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Profile Card */}
      <div className="flex-1 relative">
        <div
          className={`bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
            direction === 'left' ? '-translate-x-full rotate-[-20deg] opacity-0' :
            direction === 'right' ? 'translate-x-full rotate-[20deg] opacity-0' : ''
          }`}
        >
          {/* Photo */}
          <div className="relative h-[60%] bg-gradient-to-br from-[#E5E7EB] to-[#D1D5DB]">
            {currentProfile.photo_url ? (
              <img
                src={currentProfile.photo_url}
                alt={currentProfile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <User className="w-24 h-24 text-[#9CA3AF]" />
              </div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold">{currentProfile.name}</h2>
                {currentProfile.age && (
                  <span className="text-2xl font-medium opacity-90">
                    {currentProfile.age}
                  </span>
                )}
              </div>
              
              {currentProfile.distance && (
                <div className="flex items-center gap-2 text-sm opacity-90 mb-3">
                  <Star className="w-4 h-4" />
                  <span>{currentProfile.distance} км от вас</span>
                </div>
              )}
              
              {currentProfile.bio && (
                <p className="text-sm opacity-90 line-clamp-2">
                  {currentProfile.bio}
                </p>
              )}
            </div>

            {/* Swipe Indicators */}
            {direction === 'right' && (
              <div className="absolute top-6 left-6 border-4 border-green-500 rounded-xl px-4 py-2 -rotate-12 bg-green-500/20 backdrop-blur-sm">
                <span className="text-green-400 text-2xl font-extrabold">LIKE</span>
              </div>
            )}
            {direction === 'left' && (
              <div className="absolute top-6 right-6 border-4 border-red-500 rounded-xl px-4 py-2 rotate-12 bg-red-500/20 backdrop-blur-sm">
                <span className="text-red-400 text-2xl font-extrabold">NOPE</span>
              </div>
            )}
          </div>

          {/* Interests */}
          {currentProfile.interests && currentProfile.interests.length > 0 && (
            <div className="p-6">
              <h3 className="text-sm font-semibold text-[#1A1A2E] mb-3">Интересы</h3>
              <div className="flex flex-wrap gap-2">
                {currentProfile.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-gradient-to-r from-[#8B1E3F]/10 to-[#D4A574]/10 text-[#8B1E3F] text-sm font-medium rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-6 mt-6">
          <button
            onClick={() => handleSwipe(false)}
            className="flex items-center justify-center w-16 h-16 bg-white border-2 border-red-400 text-red-400 rounded-full shadow-lg hover:bg-red-50 hover:scale-110 transition-all"
          >
            <X className="w-7 h-7" />
          </button>
          
          <button
            onClick={() => handleSwipe(true)}
            className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8B1E3F] to-[#D4A574] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all"
          >
            <Heart className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  )
}