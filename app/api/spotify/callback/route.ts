import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get("code")
    const error = url.searchParams.get("error")
    
    // Spotifyからエラーが返された場合
    if (error) {
      console.error("Spotify OAuth error:", error)
      return NextResponse.redirect("/mypage?spotify_error=oauth")
    }
    
    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 })
    }

    // 環境変数の確認
    const client_id = process.env.SPOTIFY_CLIENT_ID
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET
    
    if (!client_id || !client_secret) {
      console.error("Spotify credentials not set:", { 
        client_id: client_id ? "Set" : "Not set",
        client_secret: client_secret ? "Set" : "Not set"
      })
      return NextResponse.redirect("/mypage?spotify_error=config")
    }

    // 動的にredirect URIを生成
    const redirect_uri = `${url.protocol}//${url.host}/api/spotify/callback`

    console.log("Spotify Callback - Redirect URI:", redirect_uri)
    console.log("Spotify Callback - Client ID:", client_id ? "Set" : "Not set")

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
      console.error("Spotify token error:", data)
      return NextResponse.redirect(`/mypage?spotify_error=${data.error}&error_description=${encodeURIComponent(data.error_description || '')}`)
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
  } catch (error) {
    console.error("Spotify callback error:", error)
    return NextResponse.redirect("/mypage?spotify_error=server")
  }
}
