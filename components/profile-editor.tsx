'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, LogOut, Save, User, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'

interface ProfileData {
  id: string
  name: string
  bio: string
  age: number | null
  gender: string
  looking_for: string
  city: string
  photo_url: string
  interests: string[]
}

async function fetchProfile(): Promise<ProfileData | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data as ProfileData | null
}

export function ProfileEditor() {
  const { data: profile, mutate, isLoading } = useSWR('my-profile', fetchProfile)
  const router = useRouter()

  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [lookingFor, setLookingFor] = useState('')
  const [city, setCity] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [newInterest, setNewInterest] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setBio(profile.bio || '')
      setAge(profile.age ? String(profile.age) : '')
      setGender(profile.gender || '')
      setLookingFor(profile.looking_for || '')
      setCity(profile.city || '')
      setPhotoUrl(profile.photo_url || '')
      setInterests(profile.interests || [])
    }
  }, [profile])

  const handleSave = useCallback(async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').update({
      name,
      bio,
      age: age ? parseInt(age) : null,
      gender: gender || null,
      looking_for: lookingFor || null,
      city,
      photo_url: photoUrl,
      interests,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    mutate()
  }, [name, bio, age, gender, lookingFor, city, photoUrl, interests, mutate])

  const handleLogout = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }, [router])

  const addInterest = useCallback(() => {
    const trimmed = newInterest.trim()
    if (trimmed && !interests.includes(trimmed)) {
      setInterests((prev) => [...prev, trimmed])
      setNewInterest('')
    }
  }, [newInterest, interests])

  const removeInterest = useCallback((interest: string) => {
    setInterests((prev) => prev.filter((i) => i !== interest))
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-4 pb-8">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Your profile photo"
            className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center border-4 border-primary/20">
            <User className="w-10 h-10 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Form fields */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name" className="text-foreground">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 rounded-xl bg-secondary text-secondary-foreground border-0 px-4"
            placeholder="Your name"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="bio" className="text-foreground">Bio</Label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="min-h-[80px] rounded-xl bg-secondary text-secondary-foreground border-0 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Tell about yourself..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="age" className="text-foreground">Age</Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="h-12 rounded-xl bg-secondary text-secondary-foreground border-0 px-4"
              placeholder="25"
              min="18"
              max="120"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="city" className="text-foreground">City</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-12 rounded-xl bg-secondary text-secondary-foreground border-0 px-4"
              placeholder="Moscow"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="gender" className="text-foreground">Gender</Label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="h-12 rounded-xl bg-secondary text-secondary-foreground border-0 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="looking_for" className="text-foreground">Looking for</Label>
            <select
              id="looking_for"
              value={lookingFor}
              onChange={(e) => setLookingFor(e.target.value)}
              className="h-12 rounded-xl bg-secondary text-secondary-foreground border-0 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="everyone">Everyone</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="photo_url" className="text-foreground">Photo URL</Label>
          <Input
            id="photo_url"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className="h-12 rounded-xl bg-secondary text-secondary-foreground border-0 px-4"
            placeholder="https://example.com/photo.jpg"
          />
        </div>

        {/* Interests */}
        <div className="flex flex-col gap-2">
          <Label className="text-foreground">Interests</Label>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span
                key={interest}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full bg-primary/10 text-primary"
              >
                {interest}
                <button
                  onClick={() => removeInterest(interest)}
                  className="hover:text-destructive transition-colors"
                  aria-label={`Remove ${interest}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addInterest()
                }
              }}
              className="h-10 rounded-xl bg-secondary text-secondary-foreground border-0 px-4"
              placeholder="Add an interest..."
            />
            <Button
              type="button"
              onClick={addInterest}
              variant="secondary"
              className="h-10 rounded-xl px-4"
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Save button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-12 rounded-xl text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Saving...
          </>
        ) : saved ? (
          'Saved!'
        ) : (
          <>
            <Save className="w-5 h-5 mr-2" />
            Save Profile
          </>
        )}
      </Button>

      {/* Logout */}
      <Button
        onClick={handleLogout}
        variant="outline"
        className="w-full h-12 rounded-xl text-base font-medium border-destructive text-destructive hover:bg-destructive/10"
      >
        <LogOut className="w-5 h-5 mr-2" />
        Log Out
      </Button>
    </div>
  )
}
