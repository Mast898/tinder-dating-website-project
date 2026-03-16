'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { User, LogOut, Camera, MapPin, Calendar, Heart, Sparkles, Save, X } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import { motion } from 'framer-motion'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    age: '',
    city: '',
    gender: '',
    looking_for: '',
    photo_url: '',
    interests: [] as string[],
    new_interest: ''
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      // ✅ БЕЗОПАСНЫЙ ДОСТУП к пользователю
      const authResponse = await supabase.auth.getUser()
      const user = authResponse.data?.user
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const profileResponse = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const profileData = profileResponse.data

      if (profileData) {
        setProfile({
          name: profileData.name || '',
          bio: profileData.bio || '',
          age: profileData.age?.toString() || '',
          city: profileData.city || '',
          gender: profileData.gender || '',
          looking_for: profileData.looking_for || '',
          photo_url: profileData.photo_url || '',
          interests: profileData.interests || [],
          new_interest: ''
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      // ✅ БЕЗОПАСНЫЙ ДОСТУП к пользователю
      const authResponse = await supabase.auth.getUser()
      const user = authResponse.data?.user
      
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: profile.name,
          bio: profile.bio,
          age: profile.age ? parseInt(profile.age) : null,
          city: profile.city,
          gender: profile.gender,
          looking_for: profile.looking_for,
          photo_url: profile.photo_url,
          interests: profile.interests,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      if (navigator.vibrate) navigator.vibrate([10, 5, 10])
      alert('Профиль успешно сохранён! ✨')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Ошибка при сохранении профиля')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const addInterest = () => {
    if (profile.new_interest.trim() && !profile.interests.includes(profile.new_interest.trim())) {
      setProfile({
        ...profile,
        interests: [...profile.interests, profile.new_interest.trim()],
        new_interest: ''
      })
    }
  }

  const removeInterest = (interest: string) => {
    setProfile({
      ...profile,
      interests: profile.interests.filter(i => i !== interest)
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addInterest()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FDF8F5] via-white to-[#F5F0EC]">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8B1E3F] to-[#D4A574] rounded-full blur-lg opacity-50 animate-pulse" />
            <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8B1E3F] to-[#D4A574] rounded-full">
              <User className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>
          <p className="text-[#6B7280] font-medium">Загрузка профиля...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-[#FDF8F5] via-white to-[#F5F0EC]">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-[#E5E7EB] px-6 py-4 z-10">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#8B1E3F] to-[#D4A574] bg-clip-text text-transparent">
            Профиль
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        
        {/* Avatar */}
        <motion.div 
          className="flex justify-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8B1E3F] to-[#D4A574] rounded-full blur-xl opacity-50" />
            <div className="relative w-32 h-32 bg-gradient-to-br from-[#E5E7EB] to-[#D1D5DB] rounded-full overflow-hidden border-4 border-white shadow-2xl">
              {profile.photo_url ? (
                <img src={profile.photo_url} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <User className="w-16 h-16 text-[#9CA3AF]" />
                </div>
              )}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-[#8B1E3F] to-[#D4A574] text-white rounded-full shadow-lg hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div 
          className="space-y-5"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">
              <User className="w-4 h-4 inline mr-1" /> Имя
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/80 backdrop-blur-xl border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#8B1E3F]/20 focus:border-[#8B1E3F] outline-none transition-all"
              placeholder="Ваше имя"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">
              <Sparkles className="w-4 h-4 inline mr-1" /> О себе
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-white/80 backdrop-blur-xl border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#8B1E3F]/20 focus:border-[#8B1E3F] outline-none transition-all resize-none"
              placeholder="Расскажите о себе..."
            />
          </div>

          {/* Age & City */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">
                <Calendar className="w-4 h-4 inline mr-1" /> Возраст
              </label>
              <input
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-xl border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#8B1E3F]/20 focus:border-[#8B1E3F] outline-none transition-all"
                placeholder="25"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">
                <MapPin className="w-4 h-4 inline mr-1" /> Город
              </label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-xl border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#8B1E3F]/20 focus:border-[#8B1E3F] outline-none transition-all"
                placeholder="Москва"
              />
            </div>
          </div>

          {/* Gender & Looking for */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">Ваш пол</label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-xl border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#8B1E3F]/20 focus:border-[#8B1E3F] outline-none transition-all"
              >
                <option value="">Выбрать</option>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
                <option value="other">Другой</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">Кого ищете</label>
              <select
                value={profile.looking_for}
                onChange={(e) => setProfile({ ...profile, looking_for: e.target.value })}
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-xl border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#8B1E3F]/20 focus:border-[#8B1E3F] outline-none transition-all"
              >
                <option value="">Выбрать</option>
                <option value="male">Мужчину</option>
                <option value="female">Женщину</option>
                <option value="both">Всех</option>
              </select>
            </div>
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">Ссылка на фото</label>
            <input
              type="url"
              value={profile.photo_url}
              onChange={(e) => setProfile({ ...profile, photo_url: e.target.value })}
              className="w-full px-4 py-3 bg-white/80 backdrop-blur-xl border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#8B1E3F]/20 focus:border-[#8B1E3F] outline-none transition-all"
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">
              <Heart className="w-4 h-4 inline mr-1" /> Интересы
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={profile.new_interest}
                onChange={(e) => setProfile({ ...profile, new_interest: e.target.value })}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-3 bg-white/80 backdrop-blur-xl border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#8B1E3F]/20 focus:border-[#8B1E3F] outline-none transition-all"
                placeholder="Добавьте интерес..."
              />
              <button
                onClick={addInterest}
                className="px-4 py-3 bg-gradient-to-r from-[#8B1E3F] to-[#D4A574] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                Добавить
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#8B1E3F]/10 to-[#D4A574]/10 text-[#8B1E3F] text-sm font-medium rounded-full"
                >
                  {interest}
                  <button onClick={() => removeInterest(interest)} className="hover:text-[#D4A574] transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <motion.button
            onClick={saveProfile}
            disabled={saving}
            className="w-full py-4 bg-gradient-to-r from-[#8B1E3F] to-[#D4A574] text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            whileTap={{ scale: 0.98 }}
          >
            <Save className="w-5 h-5" />
            {saving ? 'Сохранение...' : 'Сохранить профиль'}
          </motion.button>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full py-4 bg-white/80 backdrop-blur-xl text-[#8B1E3F] font-semibold rounded-2xl border-2 border-[#E5E7EB] hover:border-red-300 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Выйти
          </button>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  )
}