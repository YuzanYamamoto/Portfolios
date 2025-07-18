import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MapPin, Clock, Lightbulb } from "lucide-react"
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
    <div className="relative min-h-screen bg-spotify-dark text-white">
      {/* ヘッダーナビゲーション */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-spotify-dark/95 backdrop-blur-sm border-b border-spotify-gray">
        <div className="flex justify-between items-center p-4 max-w-6xl mx-auto">
          <h1 className="text-xl font-bold text-spotify-green">Tune Drive</h1>
          <Link
            href="/mypage"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-spotify-lightdark hover:bg-spotify-gray transition-colors text-spotify-lightgray hover:text-white"
          >
            <User className="h-4 w-4" />
            マイページ
          </Link>
        </div>
      </div>
      <main className="pt-24 flex flex-col items-center p-4">
        <Card className="w-full max-w-3xl bg-spotify-lightdark border-spotify-gray text-white">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-spotify-green">ドライブプラン詳細</CardTitle>
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
              <TabsList className="grid w-full grid-cols-3 gap-2 p-1 bg-spotify-dark rounded-lg overflow-hidden whitespace-nowrap">
                {plan.route.map((spot: any, index: number) => (
                  <TabsTrigger
                    key={index}
                    value={String(index)}
                    className="flex-shrink-0 px-4 py-2 rounded-md text-spotify-lightgray data-[state=active]:bg-spotify-green data-[state=active]:text-white transition-all duration-200 hover:bg-spotify-lightgray/20 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  >
                    {index + 1}. {spot.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {plan.route.map((spot: any, index: number) => (
                <TabsContent key={index} value={String(index)}>
                  <div className="bg-spotify-gray p-4 rounded-lg shadow-lg mt-4 border border-spotify-lightgray/20">
                    <h3 className="text-2xl font-bold text-spotify-green mb-2">{spot.name}</h3>
                    <p className="text-spotify-lightgray leading-relaxed mb-3">{spot.description}</p>
                    <div className="flex items-center gap-2 text-spotify-lightgray text-sm mt-3">
                      <Clock className="h-4 w-4 text-spotify-green" />
                      <span>滞在目安: {spot.stay_minutes}分</span>
                    </div>

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
      </main>
    </div>
  )
}