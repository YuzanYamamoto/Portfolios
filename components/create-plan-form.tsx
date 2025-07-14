"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader } from "@/components/loader"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function CreatePlanForm() {
  const [departure, setDeparture] = useState("")
  const [theme, setTheme] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleCreatePlan = async (e: React.FormEvent) => {
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
      const res = await fetch("/api/plan/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ departure, theme }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message)
      }

      const { plan_id } = await res.json()
      router.push(`/plan/${plan_id}`)
    } catch (err: any) {
      toast({
        title: "エラー",
        description: err.message ?? "プラン作成に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const examples = ["自然", "グルメ", "歴史", "絶景", "温泉", "アート"]

  return (
    <main className="flex min-h-screen items-center justify-center bg-spotify-dark p-4 text-white">
      <Card className="w-full max-w-md border-spotify-gray bg-spotify-lightdark text-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-spotify-green">プラン作成</CardTitle>
          <CardDescription className="text-spotify-lightgray">
            出発地とドライブのテーマを入力してAIに最適なコースを提案してもらいましょう。
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
                placeholder="例：横浜"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                className="bg-spotify-gray text-white placeholder:text-spotify-lightgray focus-visible:ring-spotify-green"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme" className="text-spotify-lightgray">
                ドライブのテーマ
              </Label>
              <Input
                id="theme"
                placeholder="例：海沿いを走りたい"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-spotify-gray text-white placeholder:text-spotify-lightgray focus-visible:ring-spotify-green"
              />
              <div className="flex flex-wrap gap-2 pt-2">
                {examples.map((ex) => (
                  <Badge
                    key={ex}
                    className="cursor-pointer bg-spotify-gray text-spotify-lightgray hover:bg-spotify-gray/80"
                    onClick={() => setTheme(ex)}
                  >
                    {ex}
                  </Badge>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-spotify-green hover:bg-spotify-green/90">
              {isLoading && <Loader className="mr-2 h-4 w-4" />}
              {isLoading ? "プランを作成中..." : "プランを作成"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
