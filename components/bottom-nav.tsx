'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Flame, Heart, MessageCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { 
    href: '/discover', 
    icon: Flame, 
    label: 'Поиск',  // ← Изменили на русский
    activeColor: 'text-[#8B1E3F]',
    badge: null  // Можно добавить счётчик
  },
  { 
    href: '/matches', 
    icon: Heart, 
    label: 'Матчи',  // ← Изменили на русский
    activeColor: 'text-[#8B1E3F]',
    badge: 3  // Пример: 3 новых матча
  },
  { 
    href: '/chat', 
    icon: MessageCircle, 
    label: 'Чат',  // ← Изменили на русский
    activeColor: 'text-[#8B1E3F]',
    badge: 1  // Пример: 1 новое сообщение
  },
  { 
    href: '/profile', 
    icon: User, 
    label: 'Профиль',  // ← Изменили на русский
    activeColor: 'text-[#8B1E3F]',
    badge: null
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-[#E5E7EB] shadow-lg" 
      role="navigation" 
      aria-label="Основная навигация"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all duration-200',
                isActive
                  ? item.activeColor
                  : 'text-[#9CA3AF] hover:text-[#6B7280]'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Icon with fill effect */}
              <div className="relative">
                <Icon 
                  className={cn(
                    'w-6 h-6 transition-all duration-200',
                    isActive && 'fill-[#8B1E3F]/20 scale-110'
                  )} 
                />
                
                {/* Badge notification */}
                {item.badge !== null && item.badge! > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-[#8B1E3F] to-[#D4A574] text-white text-[10px] font-bold rounded-full border-2 border-white">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              
              {/* Label */}
              <span className={cn(
                'text-[10px] font-medium transition-all duration-200',
                isActive && 'font-semibold'
              )}>
                {item.label}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-[#8B1E3F] rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}