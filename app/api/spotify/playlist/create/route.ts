import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const url = new URL(req.url)
  const plan_id = url.searchParams.get("plan_id")
  if (!plan_id) {
    return NextResponse.json({ error: "plan_id is required" }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect("/mypage?spotify_error=auth")
  }

  // プラン情報取得
  const { data: plan } = await supabase
    .from("plans")
    .select("theme, departure")
    .eq("id", plan_id)
    .single()
  if (!plan) {
    return NextResponse.redirect("/mypage?spotify_error=plan")
  }

  // ユーザーのSpotifyトークン取得
  const { data: userRow } = await supabase
    .from("users")
    .select("spotify_access_token")
    .eq("id", user.id)
    .single()
  if (!userRow || !userRow.spotify_access_token) {
    return NextResponse.redirect("/mypage?spotify_error=token")
  }

  // Spotifyでプレイリスト作成
  const playlistRes = await fetch("https://api.spotify.com/v1/users/" + user.id + "/playlists", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${userRow.spotify_access_token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: `${plan.theme}ドライブ`,
      description: `${plan.departure}からのドライブ用プレイリスト`,
      public: false
    })
  })
  const playlistData = await playlistRes.json()
  if (!playlistRes.ok) {
    return NextResponse.redirect("/mypage?spotify_error=playlist")
  }

  // Supabaseのplansテーブルにplaylist_idを保存
  await supabase
    .from("plans")
    .update({ spotify_playlist_id: playlistData.id })
    .eq("id", plan_id)

  return NextResponse.redirect("/mypage?spotify_success=playlist")
}
