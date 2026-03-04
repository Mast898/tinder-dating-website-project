'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Flame, Heart } from 'lucide-react'
import Link from 'next/link'

function ConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const type = searchParams.get('type')
    
    if (type === 'signup' || type === 'email') {
      setStatus('success')
      
      const timer = setTimeout(() => {
        router.push('/discover?confirmed=true')
      }, 4000)
      
      return () => clearTimeout(timer)
    } else {
      setStatus('error')
    }
  }, [searchParams, router])

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      {/* Logo */}
      <div className="flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-500 to-red-500 shadow-xl shadow-pink-500/25">
        <Flame className="w-12 h-12 text-white" />
      </div>

      {/* Status Content */}
      {status === 'loading' && (
        <>
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Подтверждение...</h1>
            <p className="text-gray-500 text-center">Проверяем ваш email</p>
          </div>
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
        </>
      )}

      {status === 'success' && (
        <>
          <div className="flex flex-col items-center gap-3">
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900">Email подтверждён!</h1>
            
            {/* Heart Animation */}
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-6 h-6 text-pink-500 animate-pulse" fill="currentColor" />
              <Heart className="w-8 h-8 text-pink-500 animate-pulse" fill="currentColor" style={{ animationDelay: '0.1s' }} />
              <Heart className="w-6 h-6 text-pink-500 animate-pulse" fill="currentColor" style={{ animationDelay: '0.2s' }} />
            </div>
            
            {/* Main Message */}
            <div className="bg-gradient-to-r from-pink-50 to-red-50 rounded-2xl p-6 border border-pink-100">
              <p className="text-lg font-semibold text-gray-800 text-center">
                🎉 Ура, желаю найти вторую половинку! 💕
              </p>
            </div>
            
            {/* Subtitle */}
            <p className="text-gray-500 text-center text-sm">
              Перенаправляем вас к новым знакомствам...
            </p>
          </div>
          
          {/* Buttons */}
          <div className="flex flex-col gap-3 w-full">
            <Link 
              href="/discover?confirmed=true"
              className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-pink-500/25"
            >
              Перейти сейчас →
            </Link>
            <Link 
              href="/profile"
              className="w-full h-12 rounded-xl bg-white border-2 border-pink-200 text-pink-600 font-semibold hover:bg-pink-50 transition-colors"
            >
              Заполнить профиль
            </Link>
          </div>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Ошибка подтверждения</h1>
            <p className="text-gray-500 text-center">Ссылка недействительна или истекла</p>
          </div>
          <Link 
            href="/auth/sign-up"
            className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Зарегистрироваться снова
          </Link>
        </>
      )}
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-pink-100 via-rose-50 to-white px-6">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10">
        <Suspense fallback={
          <div className="flex flex-col items-center gap-6 w-full max-w-md">
            <div className="flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-500 to-red-500 shadow-xl shadow-pink-500/25">
              <Flame className="w-12 h-12 text-white" />
            </div>
            <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
          </div>
        }>
          <ConfirmContent />
        </Suspense>
      </div>
    </div>
  )
}
