'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Flame, Heart, MessageCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  activeColor: string
  badge?: number | null
}

const navItems: NavItem[] = [
  { 
    href: '/discover', 
    icon: Flame, 
    label: 'Поиск',
    activeColor: 'text-[#8B1E3F]'
  },
  { 
    href: '/matches', 
    icon: Heart, 
    label: 'Матчи',
    activeColor: 'text-[#8B1E3F]'
  },
  { 
    href: '/chat', 
    icon: MessageCircle, 
    label: 'Чат',
    activeColor: 'text-[#8B1E3F]'
  },
  { 
    href: '/profile', 
    icon: User, 
    label: 'Профиль',
    activeColor: 'text-[#8B1E3F]'
  },
]

export function BottomNav() {
  const pathname = usePathname()
  const [notifications, setNotifications] = useState({
    matches: 0,
    messages: 0
  })
  const supabase = createClient()

  // ─────────────────────────────────────────────
  // 1. Динамические уведомления
  // ─────────────────────────────────────────────
  useEffect(() => {
    fetchNotifications()

    // Подписка на обновления в реальном времени
    const channel = supabase
      .channel('bottom-nav-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches'
        },
        () => {
          fetchNotifications()
          triggerHaptic('success')
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchNotifications()
          triggerHaptic('message')
        }
      )
      .subscribe()

    // Опрос каждые 30 секунд для надёжности
    const interval = setInterval(fetchNotifications, 30000)

    return () => {
      channel.unsubscribe()
      clearInterval(interval)
    }
  }, [])

  const fetchNotifications = async () => {
    try {
      const {  { user } } = await supabase.auth.getUser()
      if (!user) return

      // Новые матчи
      const { count: matchesCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('seen', false)

      // Непрочитанные сообщения
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('read', false)

      setNotifications({
        matches: matchesCount || 0,
        messages: messagesCount || 0
      })
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  // ─────────────────────────────────────────────
  // 2. Haptic Feedback (Вибрация)
  // ─────────────────────────────────────────────
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'message' = 'light') => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [40],
        success: [10, 5, 10],
        message: [15, 5, 15]
      }
      navigator.vibrate(patterns[type])
    }
  }

  const handleNavClick = (href: string) => {
    triggerHaptic('light')
  }

  // ─────────────────────────────────────────────
  // 3. Swipe между вкладками
  // ─────────────────────────────────────────────
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = navItems.findIndex(item => pathname.startsWith(item.href))
      
      if (isLeftSwipe && currentIndex < navItems.length - 1) {
        // Свайп влево → следующая вкладка
        handleNavClick(navItems[currentIndex + 1].href)
        window.location.href = navItems[currentIndex + 1].href
      }
      
      if (isRightSwipe && currentIndex > 0) {
        // Свайп вправо → предыдущая вкладка
        handleNavClick(navItems[currentIndex - 1].href)
        window.location.href = navItems[currentIndex - 1].href
      }
    }
  }

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-[#E5E7EB] shadow-lg"
      role="navigation"
      aria-label="Основная навигация"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {navItems.map((item, index) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          
          // Получаем бейдж для этой вкладки
          let badge = null
          if (item.href === '/matches') badge = notifications.matches
          if (item.href === '/chat') badge = notifications.messages

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => handleNavClick(item.href)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all duration-200',
                isActive
                  ? item.activeColor
                  : 'text-[#9CA3AF] hover:text-[#6B7280]'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Icon with fill effect */}
              <motion.div 
                className="relative"
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.1 }}
              >
                <motion.div
                  animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon 
                    className={cn(
                      'w-6 h-6 transition-all duration-200',
                      isActive && 'fill-[#8B1E3F]/20'
                    )} 
                  />
                </motion.div>
                
                {/* Badge notification */}
                <AnimatePresence>
                  {badge !== null && badge > 0 && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-[#8B1E3F] to-[#D4A574] text-white text-[10px] font-bold rounded-full border-2 border-white shadow-md"
                    >
                      {badge > 9 ? '9+' : badge}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
              
              {/* Label */}
              <motion.span 
                className={cn(
                  'text-[10px] font-medium transition-all duration-200',
                  isActive && 'font-semibold'
                )}
                animate={isActive ? { y: -1 } : { y: 0 }}
              >
                {item.label}
              </motion.span>

              {/* Active indicator dot */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="absolute -bottom-1 w-1.5 h-1.5 bg-gradient-to-r from-[#8B1E3F] to-[#D4A574] rounded-full"
                  />
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </motion.nav>
  )
}