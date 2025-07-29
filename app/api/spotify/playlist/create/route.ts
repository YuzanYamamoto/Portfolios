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
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
  }

  // プラン情報取得（overall_spotify_playlistも含む）
  const { data: plan } = await supabase
    .from("plans")
    .select("theme, departure, overall_spotify_playlist")
    .eq("id", plan_id)
    .single()
  if (!plan) {
    return NextResponse.json({ error: "プランが見つかりません" }, { status: 404 })
  }

  // ユーザーのSpotifyトークン取得
  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select("spotify_access_token")
    .eq("id", user.id)
    .single()
  
  console.log("ユーザーデータ取得結果:", { userRow, userError })
  
  if (userError) {
    console.error("ユーザーデータ取得エラー:", userError)
    return NextResponse.json({ error: "ユーザーデータの取得に失敗しました", details: userError }, { status: 400 })
  }
  
  if (!userRow || !userRow.spotify_access_token) {
    console.log("Spotifyトークンが見つかりません:", userRow)
    return NextResponse.json({ error: "Spotifyトークンが見つかりません", needsAuth: true }, { status: 400 })
  }

  try {
    // Spotifyユーザー情報を取得
    const userProfileRes = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        "Authorization": `Bearer ${userRow.spotify_access_token}`,
      }
    })
    const userProfile = await userProfileRes.json()
    if (!userProfileRes.ok) {
      console.error("Spotifyユーザー情報取得エラー:", userProfile)
      return NextResponse.json({ error: "Spotifyユーザー情報の取得に失敗しました", details: userProfile }, { status: 400 })
    }

    // プレイリストのタイトルと説明を取得
    const playlistTitle = plan.overall_spotify_playlist?.title || `${plan.theme}ドライブ`
    const playlistDescription = plan.overall_spotify_playlist?.description || `${plan.departure}からのドライブ用プレイリスト`

    // Spotifyでプレイリスト作成
    const playlistRes = await fetch(`https://api.spotify.com/v1/users/${userProfile.id}/playlists`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${userRow.spotify_access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: playlistTitle,
        description: playlistDescription,
        public: false
      })
    })
    const playlistData = await playlistRes.json()
    if (!playlistRes.ok) {
      return NextResponse.json({ error: "プレイリストの作成に失敗しました", details: playlistData }, { status: 400 })
    }

    // AIが生成した楽曲リストがある場合、楽曲を検索して追加
    if (plan.overall_spotify_playlist?.tracks && Array.isArray(plan.overall_spotify_playlist.tracks)) {
      const trackUris: string[] = []
      
      for (const track of plan.overall_spotify_playlist.tracks) {
        if (track.title && track.artist) {
          // Spotify APIで楽曲を検索
          const searchQuery = encodeURIComponent(`track:"${track.title}" artist:"${track.artist}"`)
          const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${searchQuery}&type=track&limit=1`, {
            headers: {
              "Authorization": `Bearer ${userRow.spotify_access_token}`,
            }
          })
          const searchData = await searchRes.json()
          
          if (searchRes.ok && searchData.tracks?.items?.length > 0) {
            trackUris.push(searchData.tracks.items[0].uri)
          }
        }
      }

      // 見つかった楽曲をプレイリストに追加
      if (trackUris.length > 0) {
        await fetch(`https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${userRow.spotify_access_token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            uris: trackUris
          })
        })
      }
    }

    // プレイリストのURLを生成
    const playlistUrl = `https://open.spotify.com/embed/playlist/${playlistData.id}`

    // Supabaseのplansテーブルを更新
    const updatedPlaylistData = {
      ...plan.overall_spotify_playlist,
      url: playlistUrl
    }

    await supabase
      .from("plans")
      .update({ 
        spotify_playlist_id: playlistData.id,
        overall_spotify_playlist: updatedPlaylistData
      })
      .eq("id", plan_id)

    return NextResponse.json({ 
      success: true, 
      playlist_id: playlistData.id,
      playlist_url: playlistUrl,
      message: "プレイリストが正常に作成されました"
    })

  } catch (error) {
    console.error("Spotifyプレイリスト作成エラー:", error)
    return NextResponse.json({ error: "プレイリストの作成中にエラーが発生しました" }, { status: 500 })
  }
}
