import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const client_id = process.env.SPOTIFY_CLIENT_ID!
const client_secret = process.env.SPOTIFY_CLIENT_SECRET!
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI!

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 })
  }

  const params = new URLSearchParams()
  params.append("grant_type", "authorization_code")
  params.append("code", code)
  params.append("redirect_uri", redirect_uri)
  params.append("client_id", client_id)
  params.append("client_secret", client_secret)

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  })

  const data = await res.json()
  if (data.error) {
    return NextResponse.json({ error: data.error }, { status: 400 })
  }

  // --- ここからSupabaseに保存 ---
  // セッションからユーザーID取得（例: Supabase AuthのJWTから）
  // ここではCookieから取得する例（実際はご利用の認証方式に合わせてください）
  const supabase = await createClient()
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.redirect("/mypage?spotify_error=auth")
  }

  // トークン有効期限（秒→UNIXタイムスタンプ）
  const expires_at = Math.floor(Date.now() / 1000) + (data.expires_in || 3600)

  const { error: updateError } = await supabase
    .from("users")
    .update({
      spotify_access_token: data.access_token,
      spotify_refresh_token: data.refresh_token,
      spotify_token_expires_at: expires_at
    })
    .eq("id", user.id)

  if (updateError) {
    return NextResponse.redirect("/mypage?spotify_error=update")
  }

  return NextResponse.redirect("/mypage?spotify_success=1")
}
