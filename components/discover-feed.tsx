'use client'

import { useCallback, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SwipeCard, SwipeButtons } from '@/components/swipe-card'
import { Flame, Loader2 } from 'lucide-react'
import useSWR from 'swr'

interface Profile {
  id: string
  name: string
  age: number | null
  bio: string
  city: string
  photo_url: string
  interests: string[]
}

async function fetchProfiles(): Promise<Profile[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get profiles the user has already swiped on
  const { data: existingLikes } = await supabase
    .from('likes')
    .select('to_user_id')
    .eq('from_user_id', user.id)

  const swipedIds = existingLikes?.map((l) => l.to_user_id) || []
  swipedIds.push(user.id) // exclude self

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .not('id', 'in', `(${swipedIds.join(',')})`)
    .not('name', 'eq', '')
    .limit(20)

  if (error) {
    console.error('Error fetching profiles:', error)
    return []
  }

  return (profiles || []) as Profile[]
}

export function DiscoverFeed() {
  const { data: profiles, mutate, isLoading } = useSWR('discover-profiles', fetchProfiles)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [matchAlert, setMatchAlert] = useState<string | null>(null)

  const currentProfiles = profiles || []

  const handleSwipe = useCallback(async (direction: 'left' | 'right') => {
    const profile = currentProfiles[currentIndex]
    if (!profile) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const isLike = direction === 'right'

    // Record the like/dislike
    await supabase.from('likes').insert({
      from_user_id: user.id,
      to_user_id: profile.id,
      is_like: isLike,
    })

    // Check for mutual match
    if (isLike) {
      const { data: reciprocal } = await supabase
        .from('likes')
        .select('id')
        .eq('from_user_id', profile.id)
        .eq('to_user_id', user.id)
        .eq('is_like', true)
        .single()

      if (reciprocal) {
        // Create a match
        const [user1, user2] = [user.id, profile.id].sort()
        await supabase.from('matches').insert({
          user1_id: user1,
          user2_id: user2,
        })
        setMatchAlert(profile.name)
        setTimeout(() => setMatchAlert(null), 3000)
      }
    }

    // Move to next card
    setCurrentIndex((prev) => prev + 1)

    // Refetch when running low
    if (currentIndex >= currentProfiles.length - 3) {
      mutate()
    }
  }, [currentIndex, currentProfiles, mutate])

  // Reset index when profiles refresh
  useEffect(() => {
    setCurrentIndex(0)
  }, [profiles])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  const hasProfiles = currentIndex < currentProfiles.length

  return (
    <div className="flex flex-col items-center h-full gap-6">
      {/* Match alert */}
      {matchAlert && (
        <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-center">
          <div className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl shadow-lg font-semibold text-center animate-in fade-in slide-in-from-top-3 duration-300">
            {"It's a Match with "}{matchAlert}{"!"}
          </div>
        </div>
      )}

      {/* Cards stack */}
      <div className="relative w-full max-w-sm aspect-[3/4] mx-auto">
        {hasProfiles ? (
          <>
            {/* Show next card behind */}
            {currentIndex + 1 < currentProfiles.length && (
              <SwipeCard
                key={currentProfiles[currentIndex + 1].id}
                profile={currentProfiles[currentIndex + 1]}
                onSwipe={() => {}}
                isTop={false}
              />
            )}
            {/* Current card on top */}
            <SwipeCard
              key={currentProfiles[currentIndex].id}
              profile={currentProfiles[currentIndex]}
              onSwipe={handleSwipe}
              isTop={true}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-secondary">
              <Flame className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold text-foreground">No more profiles</p>
            <p className="text-sm text-muted-foreground">Check back later for new people near you</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {hasProfiles && (
        <SwipeButtons
          onDislike={() => handleSwipe('left')}
          onLike={() => handleSwipe('right')}
        />
      )}
    </div>
  )
}
