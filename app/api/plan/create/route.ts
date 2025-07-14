import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ message: "認証が必要です。" }, { status: 401 })
  }

  const { departure, theme } = await request.json()

  if (!departure || !theme) {
    return NextResponse.json({ message: "出発地とテーマは必須です。" }, { status: 400 })
  }

  try {
    // --- Mocking GPT and Google Maps API calls ---
    // In a real application, you would call OpenAI API here to generate spots and tips,
    // and Google Maps API to calculate routes.
    // For now, we'll use dummy data.

    const dummyRoute = [
      {
        name: "江ノ島",
        description: "湘南のシンボル。展望台からの眺めは最高。",
        stay_minutes: 90,
      },
      {
        name: "新江ノ島水族館",
        description: "相模湾の生き物たちと触れ合える。",
        stay_minutes: 120,
      },
      {
        name: "鎌倉高校前踏切",
        description: "スラムダンクの聖地として有名。夕日が美しい。",
        stay_minutes: 30,
      },
    ]

    const dummyTips = "休日は江ノ島周辺が大変混雑します。朝早めの出発をおすすめします。"

    const newPlan = {
      user_id: user.id,
      departure,
      theme,
      route: dummyRoute,
      tips: dummyTips,
    }

    const { data, error } = await supabase.from("plans").insert([newPlan]).select("id").single()

    if (error) {
      console.error("Error inserting plan:", error)
      return NextResponse.json({ message: "プランの保存に失敗しました。" }, { status: 500 })
    }

    return NextResponse.json({ plan_id: data.id, status: "success" })
  } catch (error) {
    console.error("Unexpected error in plan creation API:", error)
    return NextResponse.json({ message: "サーバーエラーが発生しました。" }, { status: 500 })
  }
}
