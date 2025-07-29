"use client";
import { useState, useEffect } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";

function SortableTrack({ track, index }: { track: any, index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: track.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
  };
  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex items-center gap-2 py-1 border-b border-spotify-gray bg-spotify-lightdark rounded">
      <span className="text-spotify-lightgray">{index + 1}.</span>
      <span className="text-white">{track.name}</span>
      <span className="text-spotify-lightgray text-xs">{track.artists}</span>
    </li>
  );
}

export function PlaylistTracksEditor({ plan_id }: { plan_id: string }) {
  const [tracks, setTracks] = useState<any[]>([]);
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    async function fetchData() {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: plan } = await supabase
        .from("plans")
        .select("spotify_playlist_id")
        .eq("id", plan_id)
        .single();
      if (!plan || !plan.spotify_playlist_id) {
        setError("Spotifyプレイリスト未連携"); setLoading(false); return;
      }
      setPlaylistId(plan.spotify_playlist_id);
      const { data: userRow } = await supabase
        .from("users")
        .select("spotify_access_token")
        .limit(1)
        .single();
      if (!userRow || !userRow.spotify_access_token) {
        setError("Spotify連携が必要です"); setLoading(false); return;
      }
      setToken(userRow.spotify_access_token);
      const res = await fetch(`https://api.spotify.com/v1/playlists/${plan.spotify_playlist_id}/tracks`, {
        headers: { Authorization: `Bearer ${userRow.spotify_access_token}` }
      });
      if (!res.ok) { setError("曲一覧の取得に失敗しました"); setLoading(false); return; }
      const data = await res.json();
      setTracks(data.items.map((item: any, idx: number) => ({
        id: item.track.id,
        name: item.track.name,
        artists: item.track.artists.map((a: any) => a.name).join(', '),
        uri: item.track.uri,
        index: idx
      })));
      setLoading(false);
    }
    fetchData();
  }, [plan_id]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = tracks.findIndex(t => t.id === active.id);
      const newIndex = tracks.findIndex(t => t.id === over.id);
      setTracks(arrayMove(tracks, oldIndex, newIndex));
    }
  };

  const handleSave = async () => {
    if (!playlistId || !token) return;
    const uris = tracks.map(t => t.uri);
    await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ uris })
    });
    alert("曲順を保存しました");
  };

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>{error}</p>;
  return (
    <div className="my-6">
      <h3 className="text-lg font-bold text-spotify-green mb-2">プレイリスト曲順編集</h3>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tracks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <ul>
            {tracks.map((track, idx) => (
              <SortableTrack key={track.id} track={track} index={idx} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <Button className="mt-4 bg-spotify-green text-white" onClick={handleSave}>曲順を保存</Button>
    </div>
  );
}
