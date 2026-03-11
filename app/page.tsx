import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Flame, Heart, MessageCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/discover')
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-12">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-red-500 rounded-3xl shadow-lg mb-6">
            <Flame className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Flame</h1>
          <p className="text-xl text-gray-600 text-center">
            Найдите идеальную пару рядом с вами
          </p>
        </div>

        {/* Features */}
        <div className="max-w-md mx-auto space-y-4 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-pink-100 rounded-xl">
                <Heart className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Свайпай и находи совпадения
                </h3>
                <p className="text-sm text-gray-600">
                  Лайкай профили и получай матчи мгновенно
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl">
                <MessageCircle className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Общайся в реальном времени
                </h3>
                <p className="text-sm text-gray-600">
                  Пиши своим матчам приватно
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl">
                <Sparkles className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Умный подбор
                </h3>
                <p className="text-sm text-gray-600">
                  Находи людей по интересам
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="max-w-sm mx-auto space-y-3">
          <Link
            href="/auth/sign-up"
            className="block w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-red-500 text-white text-center font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            Создать аккаунт
          </Link>
          <Link
            href="/auth/login"
            className="block w-full py-4 px-6 bg-white text-gray-900 text-center font-semibold rounded-2xl border-2 border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-all"
          >
            Войти
          </Link>
        </div>
      </div>
    </div>
  )
}