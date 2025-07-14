import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AuthButton } from "@/components/auth-button"
import { GuestLoginButton } from "@/components/guest-login-button"

export default async function IndexPage() {
  const supabase = createClient()

  const { data } = await supabase.auth.getUser()
  const user = data?.user

  if (user) {
    // Redirect logged-in users to the plan creation page
    redirect("/plan/create")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-spotify-dark text-white">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-5xl font-bold text-spotify-green">Tune Drive</h1>
        <p className="text-lg text-spotify-lightgray">
          あなたのためのAIドライブプランナー。出発地とテーマを入力するだけで、おすすめのドライブコース、地図、旅のしおりPDF、プレイリストを自動生成します。
        </p>
        <div className="space-y-4">
          <AuthButton />
          <GuestLoginButton />
        </div>
        <p className="text-sm text-spotify-lightgray">ログインすることで、過去のプラン履歴を保存・閲覧できます。</p>
      </div>
    </main>
  )
}
