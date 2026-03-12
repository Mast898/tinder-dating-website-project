'use client'

import { useEffect, useState } from 'react'
import { Flame, Mail, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function SignUpSuccessPage() {
  const [email, setEmail] = useState('')
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    // Get email from localStorage (set during signup)
    const storedEmail = localStorage.getItem('signup_email')
    if (storedEmail) {
      setEmail(storedEmail)
    }

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FDF8F5] via-white to-[#F5F0EC] px-4">
      {/* Background decorative elements */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-[#8B1E3F]/5 rounded-full blur-3xl" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-[#D4A574]/5 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-5">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8B1E3F] to-[#D4A574] rounded-3xl blur-lg opacity-50" />
            <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8B1E3F] to-[#D4A574] rounded-3xl shadow-2xl">
              <Flame className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Success Card */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl animate-pulse" />
              <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#8B1E3F] to-[#D4A574] bg-clip-text text-transparent mb-3">
              Аккаунт создан!
            </h1>
            <p className="text-[#6B7280] text-center leading-relaxed">
              Мы отправили письмо с подтверждением на ваш email
            </p>
          </div>

          {/* Email Display */}
          {email && (
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#8B1E3F]" />
                <span className="text-sm text-[#1A1A2E] font-medium">{email}</span>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-[#FDF8F5] border border-[#D4A574]/30 rounded-2xl p-5 mb-6">
            <h3 className="font-semibold text-[#1A1A2E] mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 bg-[#D4A574]/20 rounded-full text-[#8B1E3F] text-sm">ℹ️</span>
              Что делать дальше:
            </h3>
            <ol className="space-y-2 text-sm text-[#6B7280]">
              <li className="flex items-start gap-2">
                <span className="text-[#8B1E3F] font-semibold">1.</span>
                <span>Проверьте ваш почтовый ящик</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8B1E3F] font-semibold">2.</span>
                <span>Откройте письмо от Flame</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8B1E3F] font-semibold">3.</span>
                <span>Нажмите на ссылку подтверждения</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8B1E3F] font-semibold">4.</span>
                <span>Войдите в приложение и начните знакомства!</span>
              </li>
            </ol>
          </div>

          {/* Resend Email */}
          <div className="text-center mb-6">
            <p className="text-sm text-[#6B7280] mb-3">
              Не получили письмо?
            </p>
            <button className="text-[#8B1E3F] font-semibold hover:text-[#D4A574] transition-colors text-sm">
              Отправить повторно
            </button>
            {countdown > 0 && (
              <p className="text-xs text-[#9CA3AF] mt-2">
                Через {countdown} сек
              </p>
            )}
          </div>

          {/* Continue Button */}
          <Link
            href="/auth/login"
            className="block w-full py-4 bg-gradient-to-r from-[#8B1E3F] to-[#D4A574] text-white text-center font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            Войти в аккаунт
            <ArrowRight className="inline-block w-5 h-5 ml-2" />
          </Link>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-sm text-[#9CA3AF] hover:text-[#8B1E3F] transition-colors"
            >
              ← Вернуться на главную
            </Link>
          </div>
        </div>

        {/* Tips Card */}
        <div className="mt-6 bg-gradient-to-r from-[#8B1E3F]/5 to-[#D4A574]/5 border border-[#8B1E3F]/10 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-[#8B1E3F]/10 rounded-xl flex-shrink-0">
              <Flame className="w-4 h-4 text-[#8B1E3F]" />
            </div>
            <div>
              <h4 className="font-semibold text-[#1A1A2E] text-sm mb-1">
                Совет от Flame 🔥
              </h4>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Добавьте фото и заполните профиль после подтверждения — так вы получите больше совпадений!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 