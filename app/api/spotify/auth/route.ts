import { NextRequest, NextResponse } from "next/server"

const scope = [
  "user-read-private",
  "user-read-email",
  "playlist-read-private",
  "playlist-modify-public",
  "playlist-modify-private"
].join(" ")

export async function GET(req: NextRequest) {
  console.log("=== Spotify Auth Route Started ===")
  
  try {
    // 環境変数の確認
    const client_id = process.env.SPOTIFY_CLIENT_ID
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    console.log("Environment check:", {
      SPOTIFY_CLIENT_ID: client_id ? `Set (${client_id.substring(0, 8)}...)` : "Not set",
      NODE_ENV: process.env.NODE_ENV,
      isDevelopment
    })
    
    if (!client_id) {
      console.error("SPOTIFY_CLIENT_ID is not set")
      return NextResponse.json({ 
        error: "Spotify client ID not configured",
        details: "Environment variable SPOTIFY_CLIENT_ID is missing"
      }, { status: 500 })
    }

    // リクエストURL解析
    console.log("Request URL:", req.url)
    const url = new URL(req.url)
    console.log("Parsed URL:", {
      protocol: url.protocol,
      host: url.host,
      pathname: url.pathname
    })
    
    // 開発環境での警告
    if (isDevelopment && url.host.includes('localhost')) {
      console.warn("⚠️  Development environment detected with localhost")
      console.warn("⚠️  Spotify OAuth may not work with localhost redirect URI")
      console.warn("⚠️  Consider using ngrok or deploying to test Spotify integration")
      
      // 開発環境では警告ページにリダイレクト
      return NextResponse.redirect(`${url.protocol}//${url.host}/mypage?spotify_error=dev_warning`)
    }
    
    // 動的にredirect URIを生成
    const redirect_uri = `${url.protocol}//${url.host}/api/spotify/callback`
    console.log("Generated redirect URI:", redirect_uri)
    
    const state = Math.random().toString(36).substring(2, 15)
    console.log("Generated state:", state)
    
    const params = new URLSearchParams({
      response_type: "code",
      client_id,
      scope,
      redirect_uri,
      state
    })
    
    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`
    console.log("Final auth URL:", authUrl)
    
    console.log("=== Spotify Auth Route Success ===")
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("=== Spotify Auth Route Error ===")
    console.error("Error details:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
