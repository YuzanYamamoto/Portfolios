"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader } from "@/components/loader"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User } from "lucide-react"

export default function CreatePlanPage() {
  const [departure, setDeparture] = useState("")
  const [duration, setDuration] = useState("")
  const [companion, setCompanion] = useState("")
  const [theme, setTheme] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleCreatePlan = async (e: React.FormEvent) => {
    // e の型を明示
    e.preventDefault()
    if (!departure || !duration || !companion || !theme) {
      toast({
        title: "入力エラー",
        description: "出発地、所要時間、同行者、ドライブのテーマを全て入力してください。",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/plan/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ departure, duration, companion, theme }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        // errorData.message が存在しない場合を考慮
        throw new Error(errorData.message || "プランの作成に失敗しました。")
      }

      const data = await response.json()
      toast({
        title: "プラン作成成功",
        description: "ドライブプランが生成されました！",
        variant: "default",
      })
      router.push(`/plan/${data.plan_id}`)
    } catch (error: unknown) {
      // error を unknown 型として捕捉
      console.error("Failed to create plan:", error)
      let errorMessage = "プランの作成中に不明なエラーが発生しました。"
      if (error instanceof Error) {
        // Error インスタンスであることを確認
        errorMessage = error.message
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as any).message === "string"
      ) {
        // errorData.message のようなオブジェクトの場合
        errorMessage = (error as any).message
      }

      toast({
        title: "エラー",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const themeExamples = ["自然", "グルメ", "歴史", "絶景", "温泉", "アート"]

  return (
    <div className="relative min-h-screen bg-spotify-dark text-white">
      {/* ヘッダーナビゲーション */}
      <header className="w-full bg-spotify-dark border-b border-spotify-gray">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-spotify-green">
              Tune Drive
            </Link>
            <Link
              href="/mypage"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-spotify-lightdark hover:bg-spotify-gray transition-colors text-spotify-lightgray hover:text-white"
            >
              <User className="h-4 w-4" />
              マイページ
            </Link>
          </div>
        </div>
      </header>

      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-spotify-dark text-white">
        <Card className="w-full max-w-md bg-spotify-lightdark border-spotify-gray text-white mt-20">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-spotify-green">プラン作成</CardTitle>
            <CardDescription className="text-spotify-lightgray">
              出発地とドライブのテーマを入力して、AIに最適なプランを提案してもらいましょう。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePlan} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="departure" className="text-spotify-lightgray">
                  出発地
                </Label>
                <Input
                  id="departure"
                  type="text"
                  placeholder="例：東京都渋谷区、横浜駅、札幌市中央区"
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  className="bg-spotify-gray border-spotify-gray text-white placeholder:text-spotify-lightgray focus-visible:ring-spotify-green"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-spotify-lightgray">
                  所要時間
                </Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="bg-spotify-gray border-spotify-gray text-white focus:ring-spotify-green">
                    <SelectValue placeholder="時間を選択してください" />
                  </SelectTrigger>
                  <SelectContent className="bg-spotify-gray border-spotify-gray">
                    <SelectItem value="30" className="text-white hover:bg-spotify-lightdark">30分</SelectItem>
                    <SelectItem value="45" className="text-white hover:bg-spotify-lightdark">45分</SelectItem>
                    <SelectItem value="60" className="text-white hover:bg-spotify-lightdark">1時間</SelectItem>
                    <SelectItem value="75" className="text-white hover:bg-spotify-lightdark">1時間15分</SelectItem>
                    <SelectItem value="90" className="text-white hover:bg-spotify-lightdark">1時間30分</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme" className="text-spotify-lightgray">
                  ドライブのテーマ
                </Label>
                <Select value={companion} onValueChange={setCompanion}>
                  <SelectTrigger className="bg-spotify-gray border-spotify-gray text-white focus:ring-spotify-green">
                    <SelectValue placeholder="同行者を選択してください" />
                  </SelectTrigger>
                  <SelectContent className="bg-spotify-gray border-spotify-gray">
                    <SelectItem value="家族" className="text-white hover:bg-spotify-lightdark">家族</SelectItem>
                    <SelectItem value="友達" className="text-white hover:bg-spotify-lightdark">友達</SelectItem>
                    <SelectItem value="恋人" className="text-white hover:bg-spotify-lightdark">恋人</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="theme"
                  type="text"
                  placeholder="例：海沿いを走りたい"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="bg-spotify-gray border-spotify-gray text-white placeholder:text-spotify-lightgray focus-visible:ring-spotify-green"
                  required
                />
                <div className="flex flex-wrap gap-2 pt-2">
                  {themeExamples.map((example) => (
                    <Badge
                      key={example}
                      variant="secondary"
                      className="cursor-pointer bg-spotify-gray text-spotify-lightgray hover:bg-spotify-gray/80"
                      onClick={() => setTheme(example)}
                    >
                      {example}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-spotify-green text-white hover:bg-spotify-green/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2" />
                    プランを作成中...
                  </>
                ) : (
                  "プランを作成"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}