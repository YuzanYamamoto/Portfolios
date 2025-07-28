import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
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
}

// プラン全体のSpotifyプレイリストの期待される構造を定義します
interface OverallSpotifyPlaylist {
  title: string;
  description: string;
  url: string;
}

// AIから生成されるプラン全体の構造を定義します
interface GeneratedPlan {
  route: Spot[];
  total_duration: string;
  total_distance: string;
  recommended_start_time: string;
  tips: {
    driving: string;
    preparation: string;
    budget: string;
    weather: string;
    safety: string;
  };
  local_specialties: string[];
  photo_spots: string[];
  overall_spotify_playlist?: OverallSpotifyPlaylist;
}

// 入力値のサニタイズ関数
function sanitizeInput(input: string): string {
  return input
    .replace(/[<>\"']/g, '') // HTMLタグや引用符を除去
    .replace(/javascript:/gi, '') // JavaScriptプロトコルを除去
    .trim()
    .substring(0, 200); // 長さ制限
}

// 生成されたプランの構造を検証する関数
function validateGeneratedPlan(plan: any): plan is GeneratedPlan {
  try {
    return (
      plan &&
      typeof plan === 'object' &&
      Array.isArray(plan.route) &&
      plan.route.length === 5 &&
      plan.route.every((spot: any) => 
        spot &&
        typeof spot.name === 'string' &&
        typeof spot.description === 'string' &&
        typeof spot.stay_minutes === 'number' &&
        typeof spot.category === 'string' &&
        typeof spot.address === 'string' &&
        typeof spot.best_time === 'string' &&
        Array.isArray(spot.highlights) &&
        typeof spot.budget_range === 'string' &&
        typeof spot.parking_info === 'string'
      ) &&
      typeof plan.total_duration === 'string' &&
      typeof plan.total_distance === 'string' &&
      typeof plan.recommended_start_time === 'string' &&
      plan.tips &&
      typeof plan.tips.driving === 'string' &&
      typeof plan.tips.preparation === 'string' &&
      typeof plan.tips.budget === 'string' &&
      typeof plan.tips.weather === 'string' &&
      typeof plan.tips.safety === 'string' &&
      Array.isArray(plan.local_specialties) &&
      Array.isArray(plan.photo_spots) &&
      (!plan.overall_spotify_playlist || (
        typeof plan.overall_spotify_playlist.title === 'string' &&
        typeof plan.overall_spotify_playlist.description === 'string' &&
        typeof plan.overall_spotify_playlist.url === 'string'
      ))
    );
  } catch {
    return false;
  }
}

// より堅牢なJSON解析関数
function parseAIResponse(text: string): any {
  // まずコードブロックを除去
  let cleanedText = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, "$1");
  
  // JSONの開始と終了を見つけて抽出
  const jsonMatch = cleanedText.match(/({[\s\S]*})/);
  if (jsonMatch) {
    cleanedText = jsonMatch[1];
  }
  
  return JSON.parse(cleanedText.trim());
}

// エラーレスポンス生成関数
function createErrorResponse(message: string, status: number) {
  return NextResponse.json({
    message,
    status: "error",
    timestamp: new Date().toISOString()
  }, { status });
}

export async function POST(request: Request) {
  // 開発環境でのみ環境変数の確認ログを出力
  if (process.env.NODE_ENV === 'development') {
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
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (process.env.NODE_ENV === 'development') {
    console.log("User in API route:", user ? user.id : "認証されていません");
  }

  if (!user) {
    return createErrorResponse("認証が必要です。", 401);
  }

  let requestBody;
  try {
    requestBody = await request.json();
  } catch {
    return createErrorResponse("リクエストボディが無効です。", 400);
  }

  const { departure, theme } = requestBody;

  if (!departure || !theme || typeof departure !== 'string' || typeof theme !== 'string') {
    return createErrorResponse("出発地とテーマは文字列で必須です。", 400);
  }

  // 入力値のサニタイズ
  const sanitizedDeparture = sanitizeInput(departure);
  const sanitizedTheme = sanitizeInput(theme);

  if (!sanitizedDeparture || !sanitizedTheme) {
    return createErrorResponse("入力値が無効です。", 400);
  }

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `
        あなたは経験豊富なドライブプランナーです。
        以下の情報に基づいて、魅力的で実用的なドライブを楽しめるプランを作成してください。

        ## 基本情報
        出発地: ${sanitizedDeparture}
        ドライブのテーマ: ${sanitizedTheme}

        ## 作成する内容
        1. **ルート**: 5箇所の魅力的なスポットを含む
        2. **旅のヒント**: 具体的で実用的なアドバイスと注意点
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
              "budget_range": "予算、金額は必ず「xxxx〜xxxx円」の形式で、日本円表記にしてください（例: 1000〜3000円)",
              "parking_info": "駐車場情報",
              "photo_prompt": "写真撮影のポイント"
            }
          ],
          "total_duration": "総所要時間",
          "total_distance": "総距離",
          "recommended_start_time": "おすすめの出発時間",
          "tips": {
            "driving": "運転に関するアドバイス",
            "preparation": "事前準備のポイント",
            "budget": "予算に関するアドバイス",
            "weather": "天候に関する注意点",
            "safety": "安全に関する注意事項"
          },
          "local_specialties": ["地域の特産品1", "地域の特産品2"],
          "photo_spots": ["写真撮影におすすめの場所1", "写真撮影におすすめの場所2"],
          "overall_spotify_playlist": {
            "title": "プラン全体のプレイリストタイトル",
            "description": "プラン全体のプレイリストの説明",
            "url": "https://open.spotify.com/embed/playlist/PLAYLIST_ID形式のURL"
          }
        }

        ## 重要な指示
        - 所要時間は必ず適切に計算してください
        - ルートは必ず5箇所のスポットを含む
        - 実在する場所を基に作成してください
        - ○○が食べたい等のテーマには実在する店名を表示（例：蕎麦が食べたい→実在する店名）
        - 季節や天候を考慮したプランにしてください
        - 家族連れ、カップル、友人同士など、様々な層に配慮してください
        - 地域の文化や特色を反映させてください
        - 安全運転を最優先に考慮してください
        - 予算は幅広い層に対応できるよう配慮してください
        - **overall_spotify_playlist.urlフィールドには、実際のSpotifyプレイリストの埋め込みURL（https://open.spotify.com/embed/playlist/PLAYLIST_ID形式）を使用してください**
        - JSONの形式を厳密に守り、有効なJSONを生成してください
      `,
    });

    let generatedPlan: GeneratedPlan;

    try {
      generatedPlan = parseAIResponse(text);
    } catch (parseError: unknown) {
      console.error("AIからの応答をJSONとして解析できませんでした:", parseError);
      if (process.env.NODE_ENV === 'development') {
        console.error("AIの生レスポンス:", text);
      }
      return createErrorResponse("AIからの応答を解析できませんでした。", 500);
    }

    // 生成されたプランの構造を検証
    if (!validateGeneratedPlan(generatedPlan)) {
      console.error("生成されたプランの構造が無効です");
      if (process.env.NODE_ENV === 'development') {
        console.error("無効なプラン:", generatedPlan);
      }
      return createErrorResponse("生成されたプランの構造が無効です。", 500);
    }

    const newPlan = {
      user_id: user.id,
      departure: sanitizedDeparture,
      theme: sanitizedTheme,
      route: generatedPlan.route,
      total_duration: generatedPlan.total_duration,
      total_distance: generatedPlan.total_distance,
      recommended_start_time: generatedPlan.recommended_start_time,
      tips: generatedPlan.tips,
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
      return createErrorResponse("プランの保存に失敗しました。", 500);
    }

    return NextResponse.json({ 
      plan_id: data.id, 
      status: "success",
      timestamp: new Date().toISOString()
    });

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
    } else if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as any).message === "string"
    ) {
      errorMessage = (error as any).message;
    }
    
    return createErrorResponse(errorMessage, 500);
  }
}