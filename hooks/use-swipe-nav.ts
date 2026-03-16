// hooks/use-swipe-nav.ts
'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface UseSwipeNavOptions {
  minSwipeDistance?: number
  navRoutes: string[]
}

export function useSwipeNav({
  minSwipeDistance = 50,
  navRoutes
}: UseSwipeNavOptions) {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const router = useRouter()

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }, [])

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    const currentIndex = navRoutes.findIndex(route => 
      window.location.pathname.startsWith(route)
    )

    if (isLeftSwipe && currentIndex < navRoutes.length - 1) {
      router.push(navRoutes[currentIndex + 1])
    }

    if (isRightSwipe && currentIndex > 0) {
      router.push(navRoutes[currentIndex - 1])
    }
  }, [touchStart, touchEnd, minSwipeDistance, navRoutes, router])

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  }
}