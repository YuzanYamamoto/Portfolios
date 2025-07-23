import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MapPin, CalendarDays, Music, AlertCircle } from "lucide-react"
import { logout } from "@/app/actions/logout"

interface Plan {
  id: string
  departure: string
  theme: string
  created_at: string
}

interface User {
  id: string
  email?: string
}

function ErrorComponent({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-400 text-lg">{message}</p>
      </div>
    </div>
  )
}

function UserHeader({ user }: { user: User }) {
  return (
    <div className="flex flex-row items-start justify-between w-full gap-2">
      <div className="flex-1 min-w-0">
        <CardTitle className="text-2xl sm:text-3xl font-bold text-spotify-green">
          マイページ
        </CardTitle>
        <CardDescription className="text-spotify-lightgray mt-2">
          {user.email}さんのドライブプラン履歴とプレイリストです。
        </CardDescription>
      </div>
      <div className="flex-shrink-0 -mt-1">
        <form action={logout}>
          <Button
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-black text-sm px-3 py-1"
            aria-label="ログアウト"
          >
            ログアウト
          </Button>
        </form>
      </div>
    </div>
  )
}

function PlanHistorySection({ plans }: { plans: Plan[] | null }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-spotify-green mb-4">
        ドライブプラン履歴
      </h2>
      <Separator className="bg-spotify-gray mb-4" />
      
      {plans && plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className="bg-spotify-gray border-spotify-dark text-white hover:bg-spotify-gray/80 transition-colors"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-spotify-green line-clamp-2">
                  {plan.theme}
                </CardTitle>
                <CardDescription className="text-spotify-lightgray flex items-center gap-1">
                  <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{plan.departure}から</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center gap-1 text-sm text-spotify-lightgray mb-3">
                  <CalendarDays className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <time dateTime={plan.created_at}>
                    {formatDate(plan.created_at)}
                  </time>
                </div>
                <Link href={`/plan/${plan.id}`} passHref>
                  <Button 
                    className="w-full bg-spotify-green text-white hover:bg-spotify-green/90 transition-colors"
                    aria-label={`${plan.theme}のプラン詳細を見る`}
                  >
                    プラン詳細を見る
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-spotify-lightgray mb-4">
            まだプランが作成されていません。新しいプランを作成しましょう！
          </p>
          <Link href="/plan/create">
            <Button className="bg-spotify-green text-white hover:bg-spotify-green/90">
              最初のプランを作成
            </Button>
          </Link>
        </div>
      )}
    </section>
  )
}

function SpotifyPlaylistSection() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-spotify-green mb-4">
        Spotify Playlist
      </h2>
      <Separator className="bg-spotify-gray mb-4" />
      <div className="bg-spotify-gray p-6 rounded-lg text-center">
        <Music 
          className="h-12 w-12 text-spotify-green mx-auto mb-4" 
          aria-hidden="true" 
        />
        <p className="text-spotify-lightgray text-lg mb-4">
          Spotifyとの連携はまだ準備中です。
          <br />
          近日中に、あなたのドライブにぴったりのプレイリストをここで見つけられるようになります！
        </p>
        <Button 
          className="bg-spotify-green text-white hover:bg-spotify-green/90 opacity-50 cursor-not-allowed" 
          disabled
          aria-disabled="true"
        >
          Spotifyと連携する (準備中)
        </Button>
      </div>
    </section>
  )
}

function PageHeader() {
  return (
    <header className="w-full bg-spotify-dark border-b border-spotify-gray">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="text-2xl font-bold text-spotify-green hover:text-spotify-green/90 transition-colors"
            aria-label="Tune Drive ホームページ"
          >
            Tune Drive
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/plan/create">
              <Button className="bg-spotify-green text-white hover:bg-spotify-green/90 transition-colors">
                プランを作成
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default async function MyPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError) {
    console.error("Authentication error:", authError)
    redirect("/")
  }

  if (!user) {
    redirect("/")
  }

  const { data: plans, error: plansError } = await supabase
    .from("plans")
    .select("id, departure, theme, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (plansError) {
    console.error("Error fetching plans:", plansError)
    return (
      <main className="flex min-h-screen flex-col bg-spotify-dark text-white">
        <PageHeader />
        <div className="flex-1 flex flex-col items-center p-4">
          <Card className="w-full max-w-4xl bg-spotify-lightdark border-spotify-gray text-white mt-8">
            <CardContent className="p-8">
              <ErrorComponent message="プランの取得に失敗しました。しばらく時間をおいて再度お試しください。" />
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-spotify-dark text-white">
      <PageHeader />

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col items-center p-4">
        <Card className="w-full max-w-4xl bg-spotify-lightdark border-spotify-gray text-white mt-8">
          <CardHeader>
            <UserHeader user={user} />
          </CardHeader>
          
          <CardContent className="space-y-8">
            <PlanHistorySection plans={plans} />
            <Separator className="bg-spotify-gray" />
            <SpotifyPlaylistSection />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}