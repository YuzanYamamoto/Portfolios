import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  console.log("=== Spotify Callback Route Started ===")
  
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get("code")
    const error = url.searchParams.get("error")
    const state = url.searchParams.get("state")
    
    console.log("Callback parameters:", {
      code: code ? `${code.substring(0, 20)}...` : "Not provided",
      error: error || "None",
      state: state || "None"
    })
    
    // Spotifyからエラーが返された場合
    if (error) {
      console.error("Spotify OAuth error:", error)
      return NextResponse.redirect(`${url.protocol}//${url.host}/mypage?spotify_error=oauth`)
    }
    
    if (!code) {
      console.error("No authorization code provided")
      return NextResponse.json({ error: "No code provided" }, { status: 400 })
    }

    // 環境変数の確認
    const client_id = process.env.SPOTIFY_CLIENT_ID
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET
    
    console.log("Environment variables check:", {
      client_id: client_id ? `Set (${client_id.substring(0, 8)}...)` : "Not set",
      client_secret: client_secret ? `Set (${client_secret.substring(0, 8)}...)` : "Not set",
      NODE_ENV: process.env.NODE_ENV
    })
    
    if (!client_id || !client_secret) {
      console.error("Spotify credentials not set")
      return NextResponse.redirect(`${url.protocol}//${url.host}/mypage?spotify_error=config`)
    }

    // 動的にredirect URIを生成
    const redirect_uri = `${url.protocol}//${url.host}/api/spotify/callback`
    console.log("Generated redirect URI:", redirect_uri)

    const params = new URLSearchParams()
    params.append("grant_type", "authorization_code")
    params.append("code", code)
    params.append("redirect_uri", redirect_uri)
    params.append("client_id", client_id)
    params.append("client_secret", client_secret)

    console.log("Making token request to Spotify...")
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    })

    console.log("Spotify token response status:", res.status)
    const data = await res.json()
    
    if (data.error) {
      console.error("Spotify token error:", data)
      return NextResponse.redirect(`${url.protocol}//${url.host}/mypage?spotify_error=${data.error}&error_description=${encodeURIComponent(data.error_description || '')}`)
    }

    console.log("Token received successfully:", {
      access_token: data.access_token ? `${data.access_token.substring(0, 20)}...` : "Not provided",
      refresh_token: data.refresh_token ? `${data.refresh_token.substring(0, 20)}...` : "Not provided",
      expires_in: data.expires_in
    })

    // --- ここからSupabaseに保存 ---
    console.log("Creating Supabase client...")
    const supabase = await createClient()
    
    console.log("Getting user from Supabase...")
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()
    
    if (userError) {
      console.error("Supabase user error:", userError)
      return NextResponse.redirect(`${url.protocol}//${url.host}/mypage?spotify_error=auth`)
    }
    
    if (!user) {
      console.error("No user found in session")
      return NextResponse.redirect(`${url.protocol}//${url.host}/mypage?spotify_error=auth`)
    }

    console.log("User found:", { id: user.id, email: user.email })

    // トークン有効期限（秒→UNIXタイムスタンプ）
    const expires_at = Math.floor(Date.now() / 1000) + (data.expires_in || 3600)
    console.log("Token expires at:", expires_at)

    console.log("Updating user with Spotify tokens...")
    const { error: updateError } = await supabase
      .from("users")
      .update({
        spotify_access_token: data.access_token,
        spotify_refresh_token: data.refresh_token,
        spotify_token_expires_at: expires_at
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Supabase update error:", updateError)
      return NextResponse.redirect(`${url.protocol}//${url.host}/mypage?spotify_error=update`)
    }

    console.log("=== Spotify Callback Route Success ===")
    return NextResponse.redirect(`${url.protocol}//${url.host}/mypage?spotify_success=1`)
  } catch (error) {
    console.error("Spotify callback error:", error)
    return NextResponse.redirect("/mypage?spotify_error=server")
  }
}
