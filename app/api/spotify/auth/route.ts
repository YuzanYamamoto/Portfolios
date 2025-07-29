import { NextRequest, NextResponse } from "next/server"

const scope = [
  "user-read-private",
  "user-read-email",
  "playlist-read-private",
  "playlist-modify-public",
  "playlist-modify-private"
].join(" ")

export async function GET(req: NextRequest) {
  try {
    // 環境変数の確認
    const client_id = process.env.SPOTIFY_CLIENT_ID
    if (!client_id) {
      console.error("SPOTIFY_CLIENT_ID is not set")
      return NextResponse.json({ 
        error: "Spotify client ID not configured",
        details: "Environment variable SPOTIFY_CLIENT_ID is missing"
      }, { status: 500 })
    }

    // 動的にredirect URIを生成
    const url = new URL(req.url)
    const redirect_uri = `${url.protocol}//${url.host}/api/spotify/callback`
    
    console.log("Spotify Auth - Client ID:", client_id ? "Set" : "Not set")
    console.log("Spotify Auth - Redirect URI:", redirect_uri)
    
    const state = Math.random().toString(36).substring(2, 15)
    const params = new URLSearchParams({
      response_type: "code",
      client_id,
      scope,
      redirect_uri,
      state
    })
    
    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`
    console.log("Redirecting to:", authUrl)
    
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("Spotify auth error:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
