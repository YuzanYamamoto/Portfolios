"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader } from "@/components/loader"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User } from "lucide-react"

export default function CreatePlanPage() {
  const [departure, setDeparture] = useState("")
  const [theme, setTheme] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleCreatePlan = async (e: React.FormEvent) => {
    // e の型を明示
    e.preventDefault()
    if (!departure || !theme) {
      toast({
        title: "入力エラー",
        description: "出発地とドライブのテーマを入力してください。",
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
        body: JSON.stringify({ departure, theme }),
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
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-spotify-dark text-white">
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

      {/* メインコンテンツ */}
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
                placeholder="例：横浜"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                className="bg-spotify-gray border-spotify-gray text-white placeholder:text-spotify-lightgray focus-visible:ring-spotify-green"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme" className="text-spotify-lightgray">
                ドライブのテーマ
              </Label>
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
  )
}