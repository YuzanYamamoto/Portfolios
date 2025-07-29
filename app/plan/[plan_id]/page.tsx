
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MapPin, Clock, Lightbulb, Eye, Sun, Car, Wallet, Music, Calendar, Route, AlertCircle, Camera, MapIcon, ExternalLink, User } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import dynamic from "next/dynamic";

// クライアントコンポーネントをdynamic import（ssr: false）で呼び出し
const PlaylistTracksEditor = dynamic(() => import("./PlaylistTracksEditor").then(mod => mod.PlaylistTracksEditor), { ssr: false });

interface PlanDetailsPageProps {
  params: {
    plan_id: string
  }
}

interface Plan {
  id: string;
  departure: string;
  theme: string;
  route: Spot[];
  tips: Tips;
  created_at: string;
  total_duration?: string;
  total_distance?: string;
  best_season?: string;
  difficulty_level?: string;
  recommended_start_time?: string;
  alternative_spots?: { name: string; reason: string }[];
  local_specialties?: string[];
  photo_spots?: string[];
  overall_spotify_playlist?: {
    title: string;
    description: string;
    url: string;
  };
}

interface Spot {
  name: string;
  description: string;
  stay_minutes: number;
  category: string;
  address: string;
  best_time: string;
  highlights: string[];
  budget_range: string;
  parking_info: string;
  photo_prompt?: string;
}

interface Tips {
  driving: string;
  preparation: string;
  budget: string;
  weather: string;
  safety: string;
}


const isValidPlan = (data: any): data is Plan => {
  return data &&
    typeof data.id === 'string' &&
    typeof data.departure === 'string' &&
    typeof data.theme === 'string' &&
    Array.isArray(data.route) &&
    data.tips &&
    typeof data.created_at === 'string';
};

const isValidSpot = (spot: any): spot is Spot => {
  return spot &&
    typeof spot.name === 'string' &&
    typeof spot.description === 'string' &&
    typeof spot.stay_minutes === 'number' &&
    typeof spot.address === 'string';
};

const getMapsApiKey = (): string | null => {
  const apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;
  if (!apiKey) {
    console.error("Google Maps API key is not configured");
    return null;
  }
  return apiKey;
};

export async function generateMetadata({ params }: PlanDetailsPageProps): Promise<Metadata> {
  try {
    const awaitedParams = await params;
    const { plan_id } = awaitedParams;
    const supabase = await createClient();
    const { data: plan } = await supabase
      .from("plans")
      .select("departure, theme")
      .eq("id", plan_id)
      .single();

    if (plan) {
      return {
        title: `${plan.departure}から${plan.theme}のドライブプラン | Tune Drive`,
        description: `AIが生成した${plan.departure}発の${plan.theme}テーマのドライブプラン詳細。ルート、スポット情報、プレイリストなど充実の情報をお届けします。`,
        openGraph: {
          title: `${plan.departure}から${plan.theme}のドライブプラン`,
          description: `AIが生成した${plan.departure}発の${plan.theme}テーマのドライブプラン`,
          type: 'website',
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  return {
    title: "ドライブプラン詳細 | Tune Drive",
    description: "AIが生成したドライブプランの詳細情報をご覧いただけます。",
  };
}

const GoogleMapEmbed = ({ spot, apiKey }: { spot: Spot, apiKey: string | null }) => {
  if (!apiKey) {
    return (
      <div className="w-full h-60 rounded-lg bg-spotify-lightdark border border-spotify-lightgray/20 flex items-center justify-center">
        <p className="text-spotify-lightgray text-sm">地図を表示できません</p>
      </div>
    );
  }
  return (
    <div className="w-full h-60 rounded-lg overflow-hidden border border-spotify-lightgray/20 mt-4">
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(spot.name + ' ' + spot.address)}`}
        title={`${spot.name}の地図`}
      />
    </div>
  );
};

// Spotifyプレイリストコンポーネント
const SpotifyPlaylist = ({ playlist }: { playlist: Plan['overall_spotify_playlist'] }) => {
  if (!playlist) return null;
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
          <div className="flex items-center gap-2 text-spotify-green hover:text-spotify-green/80 transition-colors">
            <ExternalLink className="h-4 w-4" />
            <a
              href={playlist.url.includes('/embed/') ? playlist.url.replace('/embed/', '/playlist/') : playlist.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline"
              aria-label="Spotifyでプレイリストを開く"
            >
              Spotifyで開く
            </a>
          </div>
        </div>
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
      </div>
      <Separator className="bg-spotify-gray" />
    </>
  );
};

// ...existing code for RouteTab...

// サーバーコンポーネント本体
export default async function PlanDetailsPage({ params }: PlanDetailsPageProps) {
  const supabase = await createClient();
  const { data: plan } = await supabase
    .from("plans")
    .select("*")
    .eq("id", params.plan_id)
    .single();
  if (!plan || !isValidPlan(plan)) {
    notFound();
  }
  const planData = plan as Plan;
  return (
    <main className="flex min-h-screen flex-col bg-spotify-dark text-white">
      {/* ヘッダーナビゲーション */}
      <header className="w-full bg-spotify-dark border-b border-spotify-gray" role="banner">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-spotify-green">
              Tune Drive
            </Link>
            <nav className="flex items-center gap-4" role="navigation" aria-label="メインナビゲーション">
              <Link href="/plan/create">
                <button className="bg-spotify-green text-white hover:bg-spotify-green/90 px-4 py-2 rounded">プランを作成</button>
              </Link>
              <Link
                href="/mypage"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-spotify-lightdark hover:bg-spotify-gray transition-colors text-spotify-lightgray hover:text-white"
                aria-label="マイページへ移動"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">マイページ</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center p-4">
        <Card className="w-full max-w-4xl bg-spotify-lightdark border-spotify-gray text-white">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-spotify-green">ドライブプラン詳細</CardTitle>
            <CardDescription className="text-spotify-lightgray">
              AIが生成したあなたのドライブプランです。
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* ...既存のplanDataを使ったUI... */}
            {/* Spotifyプレイリスト */}
            <SpotifyPlaylist playlist={planData.overall_spotify_playlist} />
            {/* 曲順編集UI（クライアントコンポーネント） */}
            <Suspense fallback={<div>曲順エディタを読み込み中...</div>}>
              <PlaylistTracksEditor plan_id={params.plan_id} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
