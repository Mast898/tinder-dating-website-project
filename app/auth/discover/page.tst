import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Flame } from 'lucide-react'
import BottomNav from '@/components/bottom-nav'
import SwipeCard from '@/components/swipe-card'

export default async function DiscoverPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Получаем профили для показа
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .neq('user_id', user.id)
    .limit(10)

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-center">
          <Flame className="w-6 h-6 text-pink-500 mr-2" />
          <h1 className="text-xl font-bold text-gray-900">Поиск</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {profiles && profiles.length > 0 ? (
          profiles.map((profile) => (
            <SwipeCard key={profile.id} profile={profile} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Flame className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Больше нет профилей
            </h2>
            <p className="text-gray-600">
              Загляните позже — рядом могут появиться новые люди
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}