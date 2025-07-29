import { NextRequest, NextResponse } from "next/server"

const client_id = process.env.SPOTIFY_CLIENT_ID!
const scope = [
  "user-read-private",
  "user-read-email",
  "playlist-read-private",
  "playlist-modify-public",
  "playlist-modify-private"
].join(" ")

export async function GET(req: NextRequest) {
  // 動的にredirect URIを生成
  const url = new URL(req.url)
  const redirect_uri = `${url.protocol}//${url.host}/api/spotify/callback`
  
  const state = Math.random().toString(36).substring(2, 15)
  const params = new URLSearchParams({
    response_type: "code",
    client_id,
    scope,
    redirect_uri,
    state
  })
  return NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  )
}
