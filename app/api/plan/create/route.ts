import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai"; // OpenAI版
// import { google } from "@ai-sdk/google" // Gemini版

// ルート内の各スポットの期待される構造を定義します
interface Spot {
  name: string;
  description: string;
  stay_minutes: number;
  category: string;
  address: string;
  best_time: string;
  highlights: string[];
  budget_range: string;
  parking_info: string;
  photo_prompt: string;
  images: string[]; // プロンプトで必須としているため、必須型に
  // spotify_playlist_url: string; // 🚨 削除: 各スポットごとのプレイリストは生成しない
}

// プラン全体のSpotifyプレイリストの期待される構造を定義します
interface OverallSpotifyPlaylist {
  title: string;
  description: string;
  // Spotifyの埋め込みURLを直接格納するように変更
  url: string; // 🚨 変更: 曲リストではなく埋め込みURLを直接ここに持つ
}

// AIから生成されるプラン全体の構造を定義します
interface GeneratedPlan {
  route: Spot[];
  total_duration: string;
  total_distance: string;
  best_season: string;
  difficulty_level: string;
  recommended_start_time: string;
  tips: {
    driving: string;
    preparation: string;
    budget: string;
    weather: string;
    safety: string;
  };
  alternative_spots: { name: string; reason: string }[];
  local_specialties: string[];
  photo_spots: string[];
  overall_spotify_playlist?: OverallSpotifyPlaylist; // プラン全体のプレイリストは引き続きオプション
}

export async function POST(request: Request) {
  // デバッグ用: 環境変数が正しく読み込まれているか確認
  console.log(
    "SUPABASE_JWT_SECRET:",
    process.env.SUPABASE_JWT_SECRET ? "読み込み済み" : "未設定または空",
  );
  console.log(
    "NEXT_PUBLIC_SUPABASE_URL:",
    process.env.NEXT_PUBLIC_SUPABASE_URL ? "読み込み済み" : "未設定または空",
  );
  console.log(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY:",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "読み込み済み" : "未設定または空",
  );

  // 🚨 修正箇所: createClient() の呼び出しに 'await' を追加
  const supabase = await createClient(); // <--- ここを修正しました！
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // デバッグ用: ユーザーが認証されているか確認
  console.log("User in API route:", user ? user.id : "認証されていません");

  if (!user) {
    return NextResponse.json({ message: "認証が必要です。" }, { status: 401 });
  }

  const { departure, theme } = await request.json();

  if (!departure || !theme) {
    return NextResponse.json(
      { message: "出発地とテーマは必須です。" },
      { status: 400 },
    );
  }

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"), // OpenAI版
      // model: google("gemini-1.5-flash"), // Gemini版（軽量で高速、クォータ消費も少ない）
      prompt: `
        あなたは経験豊富なドライブプランナーです。
        以下の情報に基づいて、近場で魅力的で実用的なドライブプランを作成してください。

        ## 基本情報
        出発地: ${departure}
        ドライブのテーマ: ${theme}

        ## 作成する内容
        1. **ルート**: 3〜5箇所の魅力的なスポットを含む
        2. **旅のヒント**: 実用的なアドバイスと注意点
        3. **総合情報**: ドライブ全体の概要
        4. **プラン全体のSpotifyプレイリストURL**: ドライブプラン全体に合うSpotifyのプレイリスト埋め込みURLを一つだけ生成してください。

        ## 出力形式
        以下のJSON形式で回答してください:
        {
          "route": [
            {
              "name": "スポット名",
              "description": "スポットの魅力的な説明（100-150文字程度）",
              "stay_minutes": 滞在時間の目安（分単位）,
              "category": "カテゴリー（観光地/グルメ/自然/体験/ショッピング等）",
              "address": "おおよその住所や場所",
              "best_time": "おすすめの時間帯",
              "highlights": ["見どころ1", "見どころ2", "見どころ3"],
              "budget_range": "予算の目安（円）",
              "parking_info": "駐車場情報",
            }
            // ... 他のスポット
          ],
          "tips": {
            "driving": "運転に関するアドバイス",
            "preparation": "事前準備のポイント",
            "budget": "予算に関するアドバイス",
            "weather": "天候に関する注意点",
            "safety": "安全に関する注意事項"
          },
          "alternative_spots": [
            {
              "name": "代替スポット名",
              "reason": "代替理由（雨天時、混雑時等）"
            }
          ],
          "local_specialties": ["地域の特産品1", "地域の特産品2"],
          "photo_spots": ["写真撮影におすすめの場所1", "写真撮影におすすめの場所2"],
          "overall_spotify_playlist": { // プラン全体用のプレイリスト
            "title": "プラン全体のプレイリストタイトル",
            "description": "プラン全体のプレイリストの説明",
            "url": "http://googleusercontent.com/spotify.com/5" // 🚨 変更: 埋め込みURLを直接ここに
          }
        }

        ## 重要な指示
        - 実在する場所や楽曲を基に作成してください。
        - 季節や天候を考慮したプランにしてください。
        - 家族連れ、カップル、友人同士など、様々な層に配慮してください。
        - 地域の文化や特色を反映させてください。
        - 安全運転を最優先に考慮してください。
        - 予算は幅広い層に対応できるよう配慮してください。
        - **\`overall_spotify_playlist.url\`フィールドには、プラン全体の雰囲気やテーマに合ったSpotifyプレイリストの埋め込みURLを1つ含めてください。必ずSpotifyの「埋め込み」形式のURL（例: \`http://googleusercontent.com/spotify.com/6\`)を使用してください。**
      `,
    });

    let generatedPlan: GeneratedPlan;

    try {
      // Markdownコードブロックの囲み (```json\n...\n```) を削除します
      const cleanedText = text.replace(/```json\n([\s\S]*?)\n```/, "$1").trim();
      generatedPlan = JSON.parse(cleanedText);
    } catch (parseError: unknown) {
      console.error("AIからの応答をJSONとして解析できませんでした:", parseError);
      console.error("AIの生レスポンス:", text); // デバッグ用に生のテキストもログに残す
      return NextResponse.json(
        { message: "AIからの応答を解析できませんでした。" },
        { status: 500 },
      );
    }

    const newPlan = {
      user_id: user.id,
      departure,
      theme,
      route: generatedPlan.route,
      total_duration: generatedPlan.total_duration,
      total_distance: generatedPlan.total_distance,
      best_season: generatedPlan.best_season,
      difficulty_level: generatedPlan.difficulty_level,
      recommended_start_time: generatedPlan.recommended_start_time,
      tips: generatedPlan.tips,
      alternative_spots: generatedPlan.alternative_spots,
      local_specialties: generatedPlan.local_specialties,
      photo_spots: generatedPlan.photo_spots,
      overall_spotify_playlist: generatedPlan.overall_spotify_playlist,
    };

    const { data, error } = await supabase
      .from("plans")
      .insert([newPlan])
      .select("id")
      .single();

    if (error) {
      console.error("プランの挿入中にエラーが発生しました:", error);
      return NextResponse.json(
        { message: "プランの保存に失敗しました。" },
        { status: 500 },
      );
    }

    return NextResponse.json({ plan_id: data.id, status: "success" });
  } catch (error: unknown) {
    console.error("AIによるプラン生成中にエラーが発生しました:", error);
    let errorMessage = "AIによるプラン生成中に不明なエラーが発生しました。";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as any).message === "string"
    ) {
      errorMessage = (error as any).message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}