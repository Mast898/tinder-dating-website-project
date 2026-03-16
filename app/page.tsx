import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Flame, Heart, MessageCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const {  { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/discover')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#FDF8F5] via-white to-[#F5F0EC]">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Burgundy blob */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#8B1E3F]/10 rounded-full blur-3xl animate-pulse" />
        
        {/* Gold blob */}
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-[#D4A574]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        
        {/* Purple accent blob */}
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-[#8B1E3F]/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative mb-6">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#8B1E3F] to-[#D4A574] rounded-3xl blur-2xl opacity-50" />
            
            {/* Logo container */}
            <div className="relative flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#8B1E3F] to-[#D4A574] rounded-3xl shadow-2xl">
              <Flame className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-[#8B1E3F] via-[#A52A4A] to-[#D4A574] bg-clip-text text-transparent">
              Flame
            </span>
          </h1>
          <p className="text-xl text-[#6B7280] text-center max-w-md">
            Найдите идеальную пару рядом с вами
          </p>
        </div>

        {/* Features */}
        <div className="max-w-md mx-auto space-y-4 mb-12 w-full">
          {/* Feature 1 */}
          <div className="group bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-white/50">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#8B1E3F]/10 to-[#D4A574]/10 rounded-xl group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-[#8B1E3F]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1A1A2E] mb-1">
                  Свайпай и находи совпадения
                </h3>
                <p className="text-sm text-[#6B7280]">
                  Лайкай профили и получай матчи мгновенно
                </p>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-white/50">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#D4A574]/20 to-[#C9A962]/20 rounded-xl group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 text-[#D4A574]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1A1A2E] mb-1">
                  Общайся в реальном времени
                </h3>
                <p className="text-sm text-[#6B7280]">
                  Пиши своим матчам приватно
                </p>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-white/50">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#8B1E3F]/10 to-[#9B2F5A]/10 rounded-xl group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-[#8B1E3F]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1A1A2E] mb-1">
                  Умный подбор
                </h3>
                <p className="text-sm text-[#6B7280]">
                  Находи людей по интересам
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="max-w-sm mx-auto space-y-3 w-full">
          <Link
            href="/auth/sign-up"
            className="block w-full py-4 px-6 bg-gradient-to-r from-[#8B1E3F] via-[#A52A4A] to-[#D4A574] text-white text-center font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            Создать аккаунт
          </Link>
          <Link
            href="/auth/login"
            className="block w-full py-4 px-6 bg-white/80 backdrop-blur-xl text-[#1A1A2E] text-center font-semibold rounded-2xl border-2 border-[#E5E7EB] hover:border-[#8B1E3F] hover:bg-[#F9FAFB] transition-all"
          >
            Войти
          </Link>
        </div>

        {/* Footer text */}
        <p className="text-xs text-[#9CA3AF] text-center mt-8 max-w-xs">
          Регистрируясь, вы соглашаетесь с нашими{' '}
          <Link href="/terms" className="underline hover:text-[#8B1E3F]">
            Условиями
          </Link>
          {' '}и{' '}
          <Link href="/privacy" className="underline hover:text-[#8B1E3F]">
            Политикой конфиденциальности
          </Link>
        </p>
      </div>
    </div>
  )
}