import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  // デバッグ用: 環境変数が正しく読み込まれているか確認
  console.log("SUPABASE_JWT_SECRET:", process.env.SUPABASE_JWT_SECRET ? "読み込み済み" : "未設定または空")
  console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "読み込み済み" : "未設定または空")
  console.log(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY:",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "読み込み済み" : "未設定または空",
  )

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // デバッグ用: ユーザーが認証されているか確認
  console.log("User in API route:", user ? user.id : "認証されていません")

  if (!user) {
    return NextResponse.json({ message: "認証が必要です。" }, { status: 401 })
  }

  const { departure, theme } = await request.json()

  if (!departure || !theme) {
    return NextResponse.json({ message: "出発地とテーマは必須です。" }, { status: 400 })
  }

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `
        あなたはドライブプランナーです。
        以下の情報に基づいて、ドライブのルートと旅のヒントをJSON形式で生成してください。
        ルートは3〜5箇所のスポットを含み、各スポットには「name」（スポット名）、「description」（説明）、「stay_minutes」（滞在時間の目安、分単位）を含めてください。
        旅のヒントは、ドライブ全体に関するアドバイスや注意点です。

        出力は以下のJSON形式に従ってください。
        {
          "route": [
            {
              "name": "スポット名1",
              "description": "スポットの説明1",
              "stay_minutes": 60
            },
            {
              "name": "スポット名2",
              "description": "スポットの説明2",
              "stay_minutes": 90
            }
          ],
          "tips": "旅のヒントやアドバイス"
        }

        出発地: ${departure}
        ドライブのテーマ: ${theme}
      `,
    })

    let generatedPlan: { route: any[]; tips: string }
    try {
      // Markdownコードブロックの囲みを削除する
      const cleanedText = text.replace(/```json\n([\s\S]*?)\n```/, "$1").trim()
      generatedPlan = JSON.parse(cleanedText)
    } catch (parseError: unknown) {
      // parseError を unknown 型として捕捉
      console.error("Failed to parse AI response as JSON:", parseError)
      console.error("AI raw response:", text) // 元のテキストもログに残す
      return NextResponse.json({ message: "AIからの応答を解析できませんでした。" }, { status: 500 })
    }

    const newPlan = {
      user_id: user.id,
      departure,
      theme,
      route: generatedPlan.route,
      tips: generatedPlan.tips,
    }

    const { data, error } = await supabase.from("plans").insert([newPlan]).select("id").single()

    if (error) {
      console.error("Error inserting plan:", error)
      return NextResponse.json({ message: "プランの保存に失敗しました。" }, { status: 500 })
    }

    return NextResponse.json({ plan_id: data.id, status: "success" })
  } catch (error: unknown) {
    // error を unknown 型として捕捉
    console.error("Error generating plan with OpenAI:", error)
    let errorMessage = "AIによるプラン生成中に不明なエラーが発生しました。"
    if (error instanceof Error) {
      // Error インスタンスであることを確認
      errorMessage = error.message
    } else if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as any).message === "string"
    ) {
      errorMessage = (error as any).message
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}
