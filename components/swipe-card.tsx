'use client'

import { useState, useRef, useCallback } from 'react'
import { Heart, X, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Profile {
  id: string
  name: string
  age: number | null
  bio: string
  city: string
  photo_url: string
  interests: string[]
}

interface SwipeCardProps {
  profile: Profile
  onSwipe: (direction: 'left' | 'right') => void
  isTop: boolean
}

export function SwipeCard({ profile, onSwipe, isTop }: SwipeCardProps) {
  const [dragX, setDragX] = useState(0)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startPos = useRef({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (!isTop) return
    setIsDragging(true)
    startPos.current = { x: clientX, y: clientY }
  }, [isTop])

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return
    const dx = clientX - startPos.current.x
    const dy = clientY - startPos.current.y
    setDragX(dx)
    setDragY(dy * 0.3)
  }, [isDragging])

  const handleEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)

    const threshold = 100
    if (dragX > threshold) {
      onSwipe('right')
    } else if (dragX < -threshold) {
      onSwipe('left')
    }

    setDragX(0)
    setDragY(0)
  }, [isDragging, dragX, onSwipe])

  const rotation = dragX * 0.08
  const opacity = Math.max(0, 1 - Math.abs(dragX) / 400)

  const likeOpacity = Math.min(1, Math.max(0, dragX / 100))
  const nopeOpacity = Math.min(1, Math.max(0, -dragX / 100))

  return (
    <div
      ref={cardRef}
      className={cn(
        'absolute inset-0 select-none rounded-3xl overflow-hidden shadow-xl bg-card',
        isTop ? 'z-10 cursor-grab' : 'z-0',
        isDragging && 'cursor-grabbing',
        !isDragging && !isTop && 'scale-[0.97] opacity-80'
      )}
      style={
        isTop
          ? {
              transform: `translate(${dragX}px, ${dragY}px) rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease-out',
            }
          : {
              transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
            }
      }
      onPointerDown={(e) => {
        if (!isTop) return
        e.preventDefault()
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        handleStart(e.clientX, e.clientY)
      }}
      onPointerMove={(e) => handleMove(e.clientX, e.clientY)}
      onPointerUp={handleEnd}
      onPointerCancel={handleEnd}
      role="article"
      aria-label={`${profile.name}${profile.age ? `, ${profile.age}` : ''}`}
    >
      {/* Photo */}
      <div className="relative w-full h-full">
        {profile.photo_url ? (
          <img
            src={profile.photo_url}
            alt={`${profile.name}'s photo`}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <span className="text-6xl font-bold text-muted-foreground/30">
              {profile.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Like/Nope stamps */}
        {isTop && (
          <>
            <div
              className="absolute top-8 left-6 border-4 border-green-500 rounded-lg px-4 py-1 -rotate-12"
              style={{ opacity: likeOpacity }}
            >
              <span className="text-green-500 text-3xl font-extrabold tracking-wider">LIKE</span>
            </div>
            <div
              className="absolute top-8 right-6 border-4 border-red-500 rounded-lg px-4 py-1 rotate-12"
              style={{ opacity: nopeOpacity }}
            >
              <span className="text-red-500 text-3xl font-extrabold tracking-wider">NOPE</span>
            </div>
          </>
        )}

        {/* Profile info */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
            {profile.age && (
              <span className="text-xl text-white/80">{profile.age}</span>
            )}
          </div>
          {profile.city && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-white/70" />
              <span className="text-sm text-white/70">{profile.city}</span>
            </div>
          )}
          {profile.bio && (
            <p className="text-sm text-white/80 mt-2 line-clamp-2">{profile.bio}</p>
          )}
          {profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {profile.interests.slice(0, 4).map((interest) => (
                <span
                  key={interest}
                  className="px-2.5 py-1 text-xs font-medium rounded-full bg-white/20 text-white backdrop-blur-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface SwipeButtonsProps {
  onDislike: () => void
  onLike: () => void
  disabled?: boolean
}

export function SwipeButtons({ onDislike, onLike, disabled }: SwipeButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-6">
      <button
        onClick={onDislike}
        disabled={disabled}
        className="flex items-center justify-center w-16 h-16 rounded-full border-2 border-destructive bg-card text-destructive shadow-lg hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
        aria-label="Dislike"
      >
        <X className="w-7 h-7" />
      </button>
      <button
        onClick={onLike}
        disabled={disabled}
        className="flex items-center justify-center w-16 h-16 rounded-full border-2 border-green-500 bg-card text-green-500 shadow-lg hover:bg-green-500 hover:text-white transition-colors disabled:opacity-50"
        aria-label="Like"
      >
        <Heart className="w-7 h-7" />
      </button>
    </div>
  )
}
