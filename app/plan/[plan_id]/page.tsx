import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Lightbulb, Clock } from "lucide-react" // Lucide icons

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
    notFound() // プランが見つからない場合は404ページを表示
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-spotify-dark text-white">
      <Card className="w-full max-w-3xl bg-spotify-lightdark border-spotify-gray text-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-spotify-green">ドライブプラン詳細</CardTitle>
          <CardDescription className="text-spotify-lightgray">AIが生成したあなたのドライブプランです。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-spotify-green" />
              <span className="text-lg font-semibold">出発地: {plan.departure}</span>
            </div>
            <Badge className="bg-spotify-green text-white text-md px-3 py-1">テーマ: {plan.theme}</Badge>
          </div>

          <Separator className="bg-spotify-gray" />

          <h2 className="text-2xl font-bold text-spotify-green">ルート</h2>
          <div className="space-y-4">
            {plan.route.map((spot: any, index: number) => (
              <div key={index} className="bg-spotify-gray p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-white">
                  {index + 1}. {spot.name}
                </h3>
                <p className="text-spotify-lightgray mt-1">{spot.description}</p>
                <div className="flex items-center gap-1 text-spotify-lightgray text-sm mt-2">
                  <Clock className="h-4 w-4" />
                  <span>滞在目安: {spot.stay_minutes}分</span>
                </div>
              </div>
            ))}
          </div>

          <Separator className="bg-spotify-gray" />

          <h2 className="text-2xl font-bold text-spotify-green">旅のヒント</h2>
          <div className="flex items-start gap-2 bg-spotify-gray p-4 rounded-lg shadow-sm">
            <Lightbulb className="h-5 w-5 text-spotify-green flex-shrink-0 mt-1" />
            <p className="text-spotify-lightgray">{plan.tips}</p>
          </div>

          <p className="text-sm text-spotify-lightgray text-right mt-4">
            作成日時: {new Date(plan.created_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
