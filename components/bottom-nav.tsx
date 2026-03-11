'use client'

import { Flame, Heart, MessageCircle, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { 
    href: '/discover', 
    icon: Flame, 
    label: 'Поиск',
    activeColor: 'text-pink-500',
    inactiveColor: 'text-gray-400'
  },
  { 
    href: '/matches', 
    icon: Heart, 
    label: 'Матчи',
    activeColor: 'text-pink-500',
    inactiveColor: 'text-gray-400'
  },
  { 
    href: '/chat', 
    icon: MessageCircle, 
    label: 'Чат',
    activeColor: 'text-pink-500',
    inactiveColor: 'text-gray-400'
  },
  { 
    href: '/profile', 
    icon: User, 
    label: 'Профиль',
    activeColor: 'text-pink-500',
    inactiveColor: 'text-gray-400'
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 safe-area-pb">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? item.activeColor : item.inactiveColor
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}