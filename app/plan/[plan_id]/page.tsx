import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MapPin, Clock, Lightbulb, Eye, Sun, Car } from "lucide-react"
import Link from "next/link"
import { User } from "lucide-react"

interface PlanDetailsPageProps {
  params: {
    plan_id: string
  }
}

export default async function PlanDetailsPage({ params }: PlanDetailsPageProps) {
  const { plan_id } = params
  const supabase = await createClient()

  const { data: plan, error } = await supabase
    .from("plans")
    .select("id, departure, theme, route, tips, created_at")
    .eq("id", plan_id)
    .single()

  if (error || !plan) {
    console.error("Error fetching plan:", error)
    notFound()
  }

  return (
    <main className="flex min-h-screen flex-col bg-spotify-dark text-white">
      {/* ヘッダーナビゲーション */}
      <header className="w-full bg-spotify-dark border-b border-spotify-gray">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-spotify-green">
              Tune Drive
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/plan/create">
                <Button className="bg-spotify-green text-white hover:bg-spotify-green/90">
                  プランを作成
                </Button>
              </Link>
              <Link
                href="/mypage"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-spotify-lightdark hover:bg-spotify-gray transition-colors text-spotify-lightgray hover:text-white"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">マイページ</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center p-4">
        <Card className="w-full max-w-3xl bg-spotify-lightdark border-spotify-gray text-white">
          <CardHeader>            <CardTitle className="text-3xl font-bold text-spotify-green">ドライブプラン詳細</CardTitle>
            <CardDescription className="text-spotify-lightgray">
              AIが生成したあなたのドライブプランです。
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 出発地・テーマ */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-spotify-green" />
                <span className="text-lg font-semibold">出発地: {plan.departure}</span>
              </div>
              <Badge className="bg-spotify-green text-white text-md px-3 py-1">テーマ: {plan.theme}</Badge>
            </div>

            <Separator className="bg-spotify-gray" />

            {/* ルートをタブで表示 */}
            <h2 className="text-2xl font-bold text-spotify-green">ルート</h2>
            <Tabs defaultValue="0" className="w-full">
              <div className="overflow-x-auto">
                <TabsList className="flex w-max min-w-full gap-2 p-1 bg-spotify-dark rounded-lg">
                  {plan.route.map((spot: any, index: number) => (
                    <TabsTrigger
                      key={index}
                      value={String(index)}
                      className="flex-shrink-0 px-3 py-2 rounded-md text-spotify-lightgray data-[state=active]:bg-spotify-green data-[state=active]:text-white transition-all duration-200 hover:bg-spotify-lightgray/20 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 text-xs sm:text-sm whitespace-nowrap"
                    >
                      <span className="block sm:hidden">{index + 1}</span>
                      <span className="hidden sm:block">{index + 1}. {spot.name}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {plan.route.map((spot: any, index: number) => (
                <TabsContent key={index} value={String(index)}>
                  <div className="bg-spotify-gray p-4 rounded-lg shadow-lg mt-4 border border-spotify-lightgray/20">
                    <h3 className="text-2xl font-bold text-spotify-green mb-2">{spot.name}</h3>
                    <p className="text-spotify-lightgray leading-relaxed mb-3">{spot.description}</p>
                    
                    {/* 基本情報を横並びに */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-spotify-lightgray text-sm mt-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-spotify-green" />
                        <span>滞在目安: {spot.stay_minutes}分</span>
                      </div>
                      {spot.best_time && (
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4 text-spotify-green" />
                          <span>おすすめ時間帯: {spot.best_time}</span>
                        </div>
                      )}
                    </div>

                    {/* 見どころ */}
                    {spot.highlights && spot.highlights.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className="h-4 w-4 text-spotify-green" />
                          <span className="text-sm font-semibold text-spotify-green">見どころ</span>
                        </div>
                        <div className="bg-spotify-lightdark p-3 rounded-md border border-spotify-lightgray/10">
                          <ul className="space-y-1">
                            {spot.highlights.map((highlight: string, idx: number) => (
                              <li key={idx} className="text-sm text-spotify-lightgray flex items-start gap-2">
                                <span className="text-spotify-green text-xs mt-1">•</span>
                                <span>{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* 駐車場情報 */}
                    {spot.parking_info && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Car className="h-4 w-4 text-spotify-green" />
                          <span className="text-sm font-semibold text-spotify-green">駐車場情報</span>
                        </div>
                        <div className="bg-spotify-lightdark p-3 rounded-md border border-spotify-lightgray/10">
                          <p className="text-sm text-spotify-lightgray">{spot.parking_info}</p>
                        </div>
                      </div>
                    )}

                    {/* 各地点のGoogle Map 埋め込み */}
                    <div className="w-full h-60 rounded-lg overflow-hidden border border-spotify-lightgray/20 mt-4">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        // 各地点のマップURLを生成
                        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_Maps_API_KEY}&q=${encodeURIComponent(spot.name)}`}
                      ></iframe>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <Separator className="bg-spotify-gray" />

            {/* ヒント */}
            <h2 className="text-2xl font-bold text-spotify-green">旅のヒント</h2>
            <div className="flex flex-col gap-2 bg-spotify-gray p-4 rounded-lg shadow-lg border border-spotify-lightgray/20">
              {plan.tips && typeof plan.tips === "object" && !Array.isArray(plan.tips) &&
                Object.entries(plan.tips).map(([key, tip]) => (
                  <div key={key} className="flex items-start gap-2 text-spotify-lightgray">
                    <Lightbulb className="h-4 w-4 text-spotify-green mt-1" />
                    <p className="text-sm">{tip}</p>
                  </div>
                ))}
            </div>

            {/* 作成日 */}
            <p className="text-sm text-spotify-lightgray text-right mt-4">
              作成日時: {new Date(plan.created_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}