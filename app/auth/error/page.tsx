import { Flame, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary">
          <Flame className="w-9 h-9 text-primary-foreground" />
        </div>

        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10">
          <AlertTriangle className="w-7 h-7 text-destructive" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Something Went Wrong</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {params?.error
              ? `Error: ${params.error}`
              : 'An unspecified error occurred. Please try again.'}
          </p>
        </div>

        <Link
          href="/auth/login"
          className="text-primary font-medium text-sm hover:underline"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}
