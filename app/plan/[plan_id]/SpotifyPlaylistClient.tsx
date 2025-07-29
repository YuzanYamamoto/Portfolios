'use client'

import { Music, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";

interface Plan {
  overall_spotify_playlist?: {
    title: string;
    description: string;
    url: string;
  };
}

interface SpotifyPlaylistClientProps {
  playlist: Plan['overall_spotify_playlist'];
  planId: string;
}

export function SpotifyPlaylistClient({ playlist, planId }: SpotifyPlaylistClientProps) {
  if (!playlist) return null;
  
  const hasValidUrl = playlist.url && 
    playlist.url.trim() !== "" && 
    !playlist.url.includes('[PLAYLIST_ID]') && 
    !playlist.url.includes('placeholder');
  
  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Music className="h-6 w-6 text-spotify-green" />
        <h2 className="text-2xl font-bold text-spotify-green">ドライブプレイリスト</h2>
      </div>
      <div className="bg-spotify-gray p-4 rounded-lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-2">
            {playlist.title}
          </h3>
          <p className="text-spotify-lightgray text-sm mb-3">
            {playlist.description}
          </p>
          
          {hasValidUrl ? (
            <div className="flex items-center gap-2 text-spotify-green hover:text-spotify-green/80 transition-colors">
              <ExternalLink className="h-4 w-4" />
              <a
                href={playlist.url.includes('/embed/playlist/') ? playlist.url.replace('/embed/playlist/', '/playlist/') : playlist.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline"
                aria-label="Spotifyでプレイリストを開く"
              >
                Spotifyで開く
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/spotify/playlist/create?plan_id=${planId}`, {
                      method: 'POST'
                    });
                    const result = await response.json();
                    if (result.success) {
                      // ページをリロードして更新されたプレイリストを表示
                      window.location.reload();
                    } else {
                      // Spotifyトークンが見つからない場合は連携ページにリダイレクト
                      if (result.error === 'Spotifyトークンが見つかりません' || result.needsAuth) {
                        if (confirm('Spotifyとの連携が必要です。連携ページに移動しますか？')) {
                          window.location.href = '/api/spotify/auth';
                        }
                      } else {
                        alert('プレイリストの作成に失敗しました: ' + result.error);
                        console.error('詳細エラー:', result);
                      }
                    }
                  } catch (error) {
                    alert('プレイリストの作成中にエラーが発生しました');
                  }
                }}
                className="bg-spotify-green text-white hover:bg-spotify-green/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Spotifyプレイリストを作成
              </button>
              <p className="text-spotify-lightgray text-xs">
                ※Spotifyアカウントでログインが必要です
              </p>
            </div>
          )}
        </div>
        
        {hasValidUrl ? (
          <Suspense fallback={
            <div className="w-full h-[352px] bg-spotify-lightdark rounded-lg flex items-center justify-center">
              <p className="text-spotify-lightgray">プレイリストを読み込んでいます...</p>
            </div>
          }>
            <div className="w-full rounded-lg overflow-hidden">
              <iframe
                src={playlist.url}
                width="100%"
                height="352"
                style={{ border: 0 }}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-lg"
                title={`Spotifyプレイリスト: ${playlist.title}`}
                sandbox="allow-scripts allow-same-origin allow-presentation"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Suspense>
        ) : (
          <div className="w-full h-[352px] bg-spotify-lightdark rounded-lg flex flex-col items-center justify-center gap-4">
            <Music className="h-12 w-12 text-spotify-lightgray" />
            <div className="text-center">
              <p className="text-spotify-lightgray text-lg mb-2">プレイリストが未作成です</p>
              <p className="text-spotify-lightgray text-sm">
                上のボタンをクリックしてSpotifyプレイリストを作成してください
              </p>
            </div>
          </div>
        )}
      </div>
      <Separator className="bg-spotify-gray" />
    </>
  );
}
