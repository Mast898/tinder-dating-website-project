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
    <div className="flex min-h-svh flex-col items-center justify-between bg-background px-6 py-12">
      <div className="flex-1 flex flex-col items-center justify-center gap-10 w-full max-w-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-primary shadow-lg shadow-primary/25">
            <Flame className="w-11 h-11 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Flame</h1>
          <p className="text-muted-foreground text-center text-base leading-relaxed text-balance">
            Discover people near you and find your perfect match
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-card-foreground">Swipe & Match</p>
              <p className="text-xs text-muted-foreground">Like profiles and get matched instantly</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/20">
              <MessageCircle className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-semibold text-sm text-card-foreground">Chat in Real-Time</p>
              <p className="text-xs text-muted-foreground">Message your matches privately</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-card-foreground">Smart Discovery</p>
              <p className="text-xs text-muted-foreground">Find people based on your interests</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm pt-8">
        <Link
          href="/auth/sign-up"
          className="flex items-center justify-center w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-colors"
        >
          Create Account
        </Link>
        <Link
          href="/auth/login"
          className="flex items-center justify-center w-full h-12 rounded-xl bg-secondary text-secondary-foreground font-semibold text-base hover:bg-secondary/80 transition-colors"
        >
          Sign In
        </Link>
      </div>
    </div>
  )
}
