import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MapPin, CalendarDays, Music } from "lucide-react"

export default async function MyPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login") // ログインしていない場合はログインページへリダイレクト
  }

  // ユーザーのプラン履歴をフェッチ
  const { data: plans, error: plansError } = await supabase
    .from("plans")
    .select("id, departure, theme, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (plansError) {
    console.error("Error fetching plans:", plansError)
    // エラーハンドリングを強化することも可能
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-spotify-dark text-white">
      <Card className="w-full max-w-4xl bg-spotify-lightdark border-spotify-gray text-white mt-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-spotify-green">マイページ</CardTitle>
          <CardDescription className="text-spotify-lightgray">
            {user.email}さんのドライブプラン履歴とプレイリストです。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* プラン作成履歴セクション */}
          <section>
            <h2 className="text-2xl font-bold text-spotify-green mb-4">ドライブプラン履歴</h2>
            <Separator className="bg-spotify-gray mb-4" />
            {plans && plans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <Card key={plan.id} className="bg-spotify-gray border-spotify-dark text-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-spotify-green">{plan.theme}</CardTitle>
                      <CardDescription className="text-spotify-lightgray flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {plan.departure}から
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex items-center gap-1 text-sm text-spotify-lightgray mb-3">
                        <CalendarDays className="h-4 w-4" />
                        {new Date(plan.created_at).toLocaleDateString()}
                      </div>
                      <Link href={`/plan/${plan.id}`} passHref>
                        <Button className="w-full bg-spotify-green text-white hover:bg-spotify-green/90">
                          プラン詳細を見る
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-spotify-lightgray">まだプランが作成されていません。新しいプランを作成しましょう！</p>
            )}
          </section>

          <Separator className="bg-spotify-gray" />

          {/* Spotify Playlist一覧セクション (プレースホルダー) */}
          <section>
            <h2 className="text-2xl font-bold text-spotify-green mb-4">Spotify Playlist</h2>
            <Separator className="bg-spotify-gray mb-4" />
            <div className="bg-spotify-gray p-6 rounded-lg text-center">
              <Music className="h-12 w-12 text-spotify-green mx-auto mb-4" />
              <p className="text-spotify-lightgray text-lg">
                Spotifyとの連携はまだ準備中です。
                <br />
                近日中に、あなたのドライブにぴったりのプレイリストをここで見つけられるようになります！
              </p>
              <Button className="mt-4 bg-spotify-green text-white hover:bg-spotify-green/90" disabled>
                Spotifyと連携する (準備中)
              </Button>
            </div>
          </section>
        </CardContent>
      </Card>
    </main>
  )
}
