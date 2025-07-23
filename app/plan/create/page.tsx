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

const DURATION_OPTIONS = [
  { value: "30", label: "30分" },
  { value: "45", label: "45分" },
  { value: "60", label: "1時間" },
  { value: "75", label: "1時間15分" },
  { value: "90", label: "1時間30分" },
] as const

const COMPANION_OPTIONS = [
  { value: "一人", label: "一人" },
  { value: "家族", label: "家族" },
  { value: "友達", label: "友達" },
  { value: "恋人", label: "恋人" },
] as const

const THEME_EXAMPLES = ["自然", "グルメ", "歴史", "絶景", "温泉", "アート", "海沿い", "山道", "街並み"] as const

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message: unknown }).message
    if (typeof message === "string") {
      return message
    }
  }
  return "プランの作成中に不明なエラーが発生しました。"
}

export default function CreatePlanPage() {
  const [departure, setDeparture] = useState("")
  const [duration, setDuration] = useState("")
  const [companion, setCompanion] = useState("")
  const [theme, setTheme] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const router = useRouter()
  const { toast } = useToast()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!departure.trim()) {
      newErrors.departure = "出発地を入力してください"
    }
    if (!duration) {
      newErrors.duration = "所要時間を選択してください"
    }
    if (!companion) {
      newErrors.companion = "同行者を選択してください"
    }
    if (!theme.trim()) {
      newErrors.theme = "ドライブのテーマを入力してください"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast({
        title: "入力エラー",
        description: "必要な項目をすべて入力してください。",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setErrors({})
    
    try {
      const response = await fetch("/api/plan/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          departure: departure.trim(), 
          duration, 
          companion, 
          theme: theme.trim() 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
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
      console.error("Failed to create plan:", error)
      const errorMessage = getErrorMessage(error)

      toast({
        title: "エラー",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleThemeSelect = (selectedTheme: string) => {
    setTheme(selectedTheme)
    if (errors.theme) {
      setErrors(prev => ({ ...prev, theme: "" }))
    }
  }

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
        <Card className="w-full max-w-lg bg-spotify-lightdark border-spotify-gray text-white mt-20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-spotify-green">プラン作成</CardTitle>
            <CardDescription className="text-spotify-lightgray">
              出発地とドライブの詳細を入力して、AIに最適なプランを提案してもらいましょう。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePlan} className="space-y-6">
              {/* 出発地 */}
              <div className="space-y-2">
                <Label htmlFor="departure" className="text-spotify-lightgray">
                  出発地 <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="departure"
                  type="text"
                  placeholder="例：東京都渋谷区、横浜駅、札幌市中央区"
                  value={departure}
                  onChange={(e) => {
                    setDeparture(e.target.value)
                    if (errors.departure) {
                      setErrors(prev => ({ ...prev, departure: "" }))
                    }
                  }}
                  className={`bg-spotify-gray border-spotify-gray text-white placeholder:text-spotify-lightgray focus-visible:ring-spotify-green ${
                    errors.departure ? "border-red-400" : ""
                  }`}
                  required
                />
                {errors.departure && (
                  <p className="text-red-400 text-sm">{errors.departure}</p>
                )}
              </div>

              {/* 所要時間 */}
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-spotify-lightgray">
                  所要時間 <span className="text-red-400">*</span>
                </Label>
                <Select 
                  value={duration} 
                  onValueChange={(value) => {
                    setDuration(value)
                    if (errors.duration) {
                      setErrors(prev => ({ ...prev, duration: "" }))
                    }
                  }}
                >
                  <SelectTrigger className={`bg-spotify-gray border-spotify-gray text-white focus:ring-spotify-green ${
                    errors.duration ? "border-red-400" : ""
                  }`}>
                    <SelectValue placeholder="時間を選択してください" />
                  </SelectTrigger>
                  <SelectContent className="bg-spotify-gray border-spotify-gray">
                    {DURATION_OPTIONS.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value} 
                        className="text-white hover:bg-spotify-lightdark"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.duration && (
                  <p className="text-red-400 text-sm">{errors.duration}</p>
                )}
              </div>

              {/* 同行者 */}
              <div className="space-y-2">
                <Label htmlFor="companion" className="text-spotify-lightgray">
                  同行者 <span className="text-red-400">*</span>
                </Label>
                <Select 
                  value={companion} 
                  onValueChange={(value) => {
                    setCompanion(value)
                    if (errors.companion) {
                      setErrors(prev => ({ ...prev, companion: "" }))
                    }
                  }}
                >
                  <SelectTrigger className={`bg-spotify-gray border-spotify-gray text-white focus:ring-spotify-green ${
                    errors.companion ? "border-red-400" : ""
                  }`}>
                    <SelectValue placeholder="同行者を選択してください" />
                  </SelectTrigger>
                  <SelectContent className="bg-spotify-gray border-spotify-gray">
                    {COMPANION_OPTIONS.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value} 
                        className="text-white hover:bg-spotify-lightdark"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.companion && (
                  <p className="text-red-400 text-sm">{errors.companion}</p>
                )}
              </div>

              {/* ドライブのテーマ */}
              <div className="space-y-2">
                <Label htmlFor="theme" className="text-spotify-lightgray">
                  ドライブのテーマ <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="theme"
                  type="text"
                  placeholder="例：海沿いを走りたい、自然を楽しみたい"
                  value={theme}
                  onChange={(e) => {
                    setTheme(e.target.value)
                    if (errors.theme) {
                      setErrors(prev => ({ ...prev, theme: "" }))
                    }
                  }}
                  className={`bg-spotify-gray border-spotify-gray text-white placeholder:text-spotify-lightgray focus-visible:ring-spotify-green ${
                    errors.theme ? "border-red-400" : ""
                  }`}
                  required
                />
                {errors.theme && (
                  <p className="text-red-400 text-sm">{errors.theme}</p>
                )}
                
                {/* テーマ例のバッジ */}
                <div className="space-y-2">
                  <p className="text-sm text-spotify-lightgray">おすすめテーマ:</p>
                  <div className="flex flex-wrap gap-2">
                    {THEME_EXAMPLES.map((example) => (
                      <Badge
                        key={example}
                        variant="secondary"
                        className="cursor-pointer bg-spotify-gray text-spotify-lightgray hover:bg-spotify-green hover:text-white transition-colors"
                        onClick={() => handleThemeSelect(example)}
                      >
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-spotify-green text-white hover:bg-spotify-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
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