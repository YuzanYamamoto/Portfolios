"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader } from "@/components/loader"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, User } from "lucide-react"

// 新しいインポート
import { FormErrors, CreatePlanRequest } from "@/types"
import { 
  DURATION_OPTIONS, 
  COMPANION_OPTIONS, 
  MUSIC_GENRE_OPTIONS,
  THEME_EXAMPLES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES 
} from "@/constants"
import { 
  validatePlanForm, 
  getErrorMessage, 
  getCompletedFields 
} from "@/lib/utils/validation"
import { createPlan } from "@/lib/utils/api"
import { Header } from "@/components/common/header"
import { BackgroundAnimation } from "@/components/common/background-animation"
import { FormField } from "@/components/forms/form-field"
import { ThemeSelector } from "@/components/forms/theme-selector"

export default function CreatePlanPage() {
  const [departure, setDeparture] = useState("")
  const [duration, setDuration] = useState("")
  const [companion, setCompanion] = useState("")
  const [theme, setTheme] = useState("")
  const [musicGenre, setMusicGenre] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set())
  const [isAnimating, setIsAnimating] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()

  // フィールドの完了状態を更新
  useEffect(() => {
    const completed = new Set<string>()
    if (departure.trim()) completed.add('departure')
    if (duration) completed.add('duration')
    if (companion) completed.add('companion')
    if (theme.trim()) completed.add('theme')
    if (musicGenre) completed.add('musicGenre')
    setCompletedFields(completed)
  }, [departure, duration, companion, theme, musicGenre])

  // プログレス計算
  const progress = (completedFields.size / 4) * 100 // 必須フィールドは4つ

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
          theme: theme.trim(),
          musicGenre: musicGenre || undefined
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
    <div className="relative min-h-screen bg-gradient-to-br from-spotify-dark via-gray-900/20 to-spotify-dark text-white overflow-x-hidden">
      {/* 背景アニメーション */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-spotify-green/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* ヘッダーナビゲーション */}
      <header className="fixed top-0 left-0 w-full bg-spotify-dark/80 backdrop-blur-md border-b border-spotify-gray z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-spotify-green">
              Tune Drive
            </Link>
            <Link
              href="/mypage"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-spotify-lightdark hover:bg-spotify-gray transition-all duration-300 text-spotify-lightgray hover:text-white hover:scale-105"
            >
              <User className="h-4 w-4" />
              マイページ
            </Link>
          </div>
        </div>
      </header>

      <main className="flex min-h-screen flex-col items-center justify-center p-4 relative z-10">
        <Card className="w-full max-w-lg bg-spotify-lightdark/80 backdrop-blur-md border-spotify-gray text-white shadow-2xl mt-20">
          <CardHeader className="text-center relative">
            <div className="absolute -top-2 -right-2">
              <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-spotify-green to-green-400 bg-clip-text text-transparent">
              プラン作成
            </CardTitle>
            <CardDescription className="text-spotify-lightgray text-lg">
              🎵 音楽と共に最高のドライブプランを作りましょう！
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePlan} className="space-y-8">
              {/* 出発地 */}
              <div className="space-y-3 group">
                <Label htmlFor="departure" className="text-spotify-lightgray font-medium">
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
                  className={`bg-spotify-gray/50 border-spotify-gray text-white placeholder:text-spotify-lightgray focus-visible:ring-spotify-green focus-visible:border-spotify-green transition-all duration-300 hover:bg-spotify-gray/70 ${
                    errors.departure ? "border-red-400" : ""
                  } ${completedFields.has('departure') ? "border-spotify-green/50" : ""}`}
                  required
                />
                {errors.departure && (
                  <p className="text-red-400 text-sm animate-pulse">{errors.departure}</p>
                )}
              </div>

              {/* 所要時間 */}
              <div className="space-y-3 group">
                <Label htmlFor="duration" className="text-spotify-lightgray font-medium">
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
                  <SelectTrigger
                    id="duration"
                    className={`bg-spotify-gray/50 border-spotify-gray text-white focus:ring-spotify-green focus:border-spotify-green transition-all duration-300 hover:bg-spotify-gray/70 ${
                      errors.duration ? "border-red-400" : ""
                    } ${completedFields.has('duration') ? "border-spotify-green/50" : ""}`}
                  >
                    <SelectValue placeholder="時間を選択してください" />
                  </SelectTrigger>
                  <SelectContent className="bg-spotify-gray border-spotify-gray z-[60]">
                    {DURATION_OPTIONS.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value} 
                        className="text-white hover:bg-spotify-lightdark focus:bg-spotify-green focus:text-white"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.duration && (
                  <p className="text-red-400 text-sm animate-pulse">{errors.duration}</p>
                )}
              </div>

              {/* 同行者 */}
              <div className="space-y-3 group">
                <Label htmlFor="companion" className="text-spotify-lightgray font-medium">
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
                  <SelectTrigger
                    id="companion"
                    className={`bg-spotify-gray/50 border-spotify-gray text-white focus:ring-spotify-green focus:border-spotify-green transition-all duration-300 hover:bg-spotify-gray/70 ${
                      errors.companion ? "border-red-400" : ""
                    } ${completedFields.has('companion') ? "border-spotify-green/50" : ""}`}
                  >
                    <SelectValue placeholder="同行者を選択してください" />
                  </SelectTrigger>
                  <SelectContent className="bg-spotify-gray border-spotify-gray z-[60]">
                    {COMPANION_OPTIONS.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value} 
                        className="text-white hover:bg-spotify-lightdark focus:bg-spotify-green focus:text-white"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.companion && (
                  <p className="text-red-400 text-sm animate-pulse">{errors.companion}</p>
                )}
              </div>

              {/* ドライブのテーマ */}
              <div className="space-y-3 group">
                <Label htmlFor="theme" className="text-spotify-lightgray font-medium">
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
                  className={`bg-spotify-gray/50 border-spotify-gray text-white placeholder:text-spotify-lightgray focus-visible:ring-spotify-green focus-visible:border-spotify-green transition-all duration-300 hover:bg-spotify-gray/70 ${
                    errors.theme ? "border-red-400" : ""
                  } ${completedFields.has('theme') ? "border-spotify-green/50" : ""}`}
                  required
                />
                {errors.theme && (
                  <p className="text-red-400 text-sm animate-pulse">{errors.theme}</p>
                )}
                
                {/* テーマ例のバッジ */}
                <div className="space-y-3">
                  <p className="text-sm text-spotify-lightgray">
                    おすすめテーマ:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {THEME_EXAMPLES.map((example, index) => (
                      <Badge
                        key={example}
                        variant="secondary"
                        className="cursor-pointer bg-gradient-to-r from-spotify-gray to-spotify-lightdark text-spotify-lightgray hover:from-spotify-green hover:to-green-400 hover:text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                        onClick={() => handleThemeSelect(example)}
                        style={{
                          animationDelay: `${index * 100}ms`
                        }}
                      >
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* 音楽ジャンル */}
              <div className="space-y-3 group">
                <Label htmlFor="musicGenre" className="text-spotify-lightgray font-medium">
                  音楽ジャンル（プレイリスト用）
                </Label>
                <Select 
                  value={musicGenre} 
                  onValueChange={(value) => {
                    setMusicGenre(value)
                    if (errors.musicGenre) {
                      setErrors(prev => ({ ...prev, musicGenre: "" }))
                    }
                  }}
                >
                  <SelectTrigger
                    id="musicGenre"
                    className={`bg-spotify-gray/50 border-spotify-gray text-white focus:ring-spotify-green focus:border-spotify-green transition-all duration-300 hover:bg-spotify-gray/70 ${
                      completedFields.has('musicGenre') ? "border-spotify-green/50" : ""
                    }`}
                  >
                    <SelectValue placeholder="お好みの音楽ジャンルを選択（任意）" />
                  </SelectTrigger>
                  <SelectContent className="bg-spotify-gray border-spotify-gray z-[60]">
                    {MUSIC_GENRE_OPTIONS.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value} 
                        className="text-white hover:bg-spotify-lightdark focus:bg-spotify-green focus:text-white"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-spotify-lightgray">
                  選択したジャンルに基づいてSpotifyプレイリストが生成されます
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-spotify-green text-white hover:bg-white hover:text-spotify-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 font-semibold py-3 text-lg border-2 border-spotify-green"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    AIがプランを作成中...
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    プランを作成
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
