'use client'

import { Flame } from 'lucide-react'
import Link from 'next/link'

export default function ErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-pink-50 to-white px-6">
      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        <div className="flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-500 to-red-500 shadow-xl shadow-pink-500/25">
          <Flame className="w-12 h-12 text-white" />
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Что-то пошло не так</h1>
          <p className="text-gray-500 text-center">Ссылка недействительна или истекла срок действия</p>
        </div>

        <Link 
          href="/auth/sign-up"
          className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold hover:opacity-90 transition-opacity"
        >
          Зарегистрироваться снова
        </Link>

        <Link 
          href="/auth/login"
          className="text-pink-500 hover:text-pink-600 font-medium"
        >
          Войти вместо этого
        </Link>
      </div>
    </div>
  )
}
