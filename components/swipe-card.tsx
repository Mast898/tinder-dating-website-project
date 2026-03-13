'use client'

import { useState } from 'react'
import { Heart, X, Star, User } from 'lucide-react'

interface Profile {
  id: string
  name: string
  age: number
  bio: string
  photo_url: string
  distance?: number
  interests?: string[]
}

interface SwipeCardProps {
  profile: Profile
  onLike?: () => void
  onNope?: () => void
}

export function SwipeCard({ profile, onLike, onNope }: SwipeCardProps) {
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)

  const handleSwipe = (liked: boolean) => {
    setDirection(liked ? 'right' : 'left')
    setTimeout(() => {
      if (liked) onLike?.()
      else onNope?.()
    }, 300)
  }

  return (
    <div
      className={`bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
        direction === 'left' ? '-translate-x-full rotate-[-20deg] opacity-0' :
        direction === 'right' ? 'translate-x-full rotate-[20deg] opacity-0' : ''
      }`}
    >
      {/* Photo */}
      <div className="relative h-96 bg-gradient-to-br from-[#E5E7EB] to-[#D1D5DB]">
        {profile.photo_url ? (
          <img
            src={profile.photo_url}
            alt={profile.name}
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
            <h2 className="text-3xl font-bold">{profile.name}</h2>
            {profile.age && (
              <span className="text-2xl font-medium opacity-90">
                {profile.age}
              </span>
            )}
          </div>
          
          {profile.distance && (
            <div className="flex items-center gap-2 text-sm opacity-90 mb-3">
              <Star className="w-4 h-4" />
              <span>{profile.distance} км от вас</span>
            </div>
          )}
          
          {profile.bio && (
            <p className="text-sm opacity-90 line-clamp-2">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      {/* Interests */}
      {profile.interests && profile.interests.length > 0 && (
        <div className="p-6">
          <h3 className="text-sm font-semibold text-[#1A1A2E] mb-3">Интересы</h3>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest, index) => (
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
  )
}