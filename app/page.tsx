import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AuthButton } from "@/components/auth-button"
import { GuestLoginButton } from "@/components/guest-login-button"
import { BackgroundAnimation } from "@/components/common/background-animation"
import { APP_CONFIG, ROUTES } from "@/constants"

export default async function IndexPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const user = data?.user

  if (user) {
    redirect(ROUTES.PLAN_CREATE)
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-spotify-dark via-gray-900/20 to-spotify-dark text-white overflow-hidden">
      <BackgroundAnimation />

      <div className="flex min-h-screen flex-col items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md space-y-8 text-center">
          <header>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-spotify-green to-green-400 bg-clip-text text-transparent">
              {APP_CONFIG.APP_NAME}
            </h1>
          </header>
          
          <section>
            <p className="text-xl text-spotify-lightgray leading-relaxed">
              {APP_CONFIG.APP_DESCRIPTION}
              出発地とテーマを入力するだけで、おすすめのドライブコース、地図、Spotifyプレイリストを自動生成します。
            </p>
          </section>
          
          <section className="space-y-4">
            <div className="transform transition-all duration-300 hover:scale-105">
              <AuthButton />
            </div>
            <div className="transform transition-all duration-300 hover:scale-105">
              <GuestLoginButton />
            </div>
          </section>
          
          <footer>
            <p className="text-sm text-spotify-lightgray opacity-80">
              ✨ ログインすることで、過去のプラン履歴を保存・閲覧できます。
            </p>
          </footer>
        </div>
      </div>
    </main>
  )
}
