
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

// クライアントコンポーネントをdynamic importで呼び出し
const PlaylistTracksEditor = dynamic(() => import("./PlaylistTracksEditor").then(mod => mod.PlaylistTracksEditor));

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
            {/* プラン基本情報 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-spotify-green" />
                <h2 className="text-xl font-semibold text-white">出発地: {planData.departure}</h2>
              </div>
              <div className="flex items-center gap-2">
                <Route className="h-5 w-5 text-spotify-green" />
                <h2 className="text-xl font-semibold text-white">テーマ: {planData.theme}</h2>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-spotify-green" />
                <span className="text-spotify-lightgray">
                  作成日: {new Date(planData.created_at).toLocaleDateString('ja-JP')}
                </span>
              </div>
            </div>

            <Separator className="bg-spotify-gray" />

            {/* スポット別タブ */}
            <Tabs defaultValue="spot-0" className="w-full">
              <TabsList className="grid w-full bg-spotify-gray overflow-x-auto" style={{ gridTemplateColumns: `repeat(${planData.route.length}, minmax(120px, 1fr))` }}>
                {planData.route.map((spot, index) => (
                  <TabsTrigger 
                    key={index} 
                    value={`spot-${index}`} 
                    className="data-[state=active]:bg-spotify-green text-xs px-2 py-1 whitespace-nowrap"
                  >
                    {index + 1}. {spot.name.length > 8 ? spot.name.substring(0, 8) + '...' : spot.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {planData.route.map((spot, index) => (
                <TabsContent key={index} value={`spot-${index}`} className="space-y-4">
                  <Card className="bg-spotify-gray border-spotify-lightgray/20">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl text-spotify-green">
                            {index + 1}. {spot.name}
                          </CardTitle>
                          <CardDescription className="text-spotify-lightgray">
                            {spot.category} • {spot.stay_minutes}分滞在
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-spotify-lightgray border-spotify-lightgray">
                          {spot.best_time}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-white text-lg">{spot.description}</p>
                      
                      <div className="flex items-center gap-2 text-spotify-lightgray">
                        <MapPin className="h-5 w-5" />
                        <span>{spot.address}</span>
                      </div>

                      {spot.highlights && spot.highlights.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-spotify-green mb-3">見どころ:</h4>
                          <ul className="list-disc list-inside space-y-2 text-spotify-lightgray">
                            {spot.highlights.map((highlight, idx) => (
                              <li key={idx}>{highlight}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-5 w-5 text-spotify-green" />
                          <span className="text-white">予算: {spot.budget_range}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Car className="h-5 w-5 text-spotify-green" />
                          <span className="text-white">駐車場: {spot.parking_info}</span>
                        </div>
                      </div>

                      <GoogleMapEmbed spot={spot} apiKey={getMapsApiKey()} />

                      {/* スポット固有の追加情報 */}
                      <Separator className="bg-spotify-lightgray/20" />
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-spotify-green">このスポットの詳細情報</h4>
                        
                        <div className="grid gap-4">
                          {planData.total_duration && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-5 w-5 text-spotify-green" />
                              <span className="text-white">総所要時間: {planData.total_duration}</span>
                            </div>
                          )}
                          
                          {planData.total_distance && (
                            <div className="flex items-center gap-2">
                              <MapIcon className="h-5 w-5 text-spotify-green" />
                              <span className="text-white">総距離: {planData.total_distance}</span>
                            </div>
                          )}

                          {planData.best_season && (
                            <div className="flex items-center gap-2">
                              <Sun className="h-5 w-5 text-spotify-green" />
                              <span className="text-white">ベストシーズン: {planData.best_season}</span>
                            </div>
                          )}

                          {planData.recommended_start_time && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-5 w-5 text-spotify-green" />
                              <span className="text-white">推奨出発時間: {planData.recommended_start_time}</span>
                            </div>
                          )}

                          {planData.photo_spots && planData.photo_spots.length > 0 && (
                            <Card className="bg-spotify-lightdark border-spotify-lightgray/20">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-spotify-green text-base">
                                  <Camera className="h-4 w-4" />
                                  写真撮影スポット
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ul className="list-disc list-inside space-y-1 text-white text-sm">
                                  {planData.photo_spots.map((photoSpot, photoIndex) => (
                                    <li key={photoIndex}>{photoSpot}</li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          )}

                          {planData.local_specialties && planData.local_specialties.length > 0 && (
                            <Card className="bg-spotify-lightdark border-spotify-lightgray/20">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-spotify-green text-base">
                                  <Eye className="h-4 w-4" />
                                  地域の特産品
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ul className="list-disc list-inside space-y-1 text-white text-sm">
                                  {planData.local_specialties.map((specialty, specialtyIndex) => (
                                    <li key={specialtyIndex}>{specialty}</li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          )}

                          {planData.alternative_spots && planData.alternative_spots.length > 0 && (
                            <Card className="bg-spotify-lightdark border-spotify-lightgray/20">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-spotify-green text-base">
                                  <MapPin className="h-4 w-4" />
                                  代替スポット
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  {planData.alternative_spots.map((altSpot, altIndex) => (
                                    <div key={altIndex} className="border-l-2 border-spotify-green pl-3">
                                      <h5 className="font-semibold text-white text-sm">{altSpot.name}</h5>
                                      <p className="text-xs text-spotify-lightgray">{altSpot.reason}</p>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>

            <Separator className="bg-spotify-gray" />

            {/* Spotifyプレイリスト */}
            <SpotifyPlaylist playlist={planData.overall_spotify_playlist} />
            
            {/* 曲順編集UI（クライアントコンポーネント） */}
            <Suspense fallback={<div>曲順エディタを読み込み中...</div>}>
              <PlaylistTracksEditor plan_id={params.plan_id} />
            </Suspense>

            <Separator className="bg-spotify-gray" />

            {/* アドバイス（Spotifyプレイリストの下に移動） */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-6 w-6 text-spotify-green" />
                <h2 className="text-2xl font-bold text-spotify-green">ドライブのアドバイス</h2>
              </div>
              
              <div className="grid gap-4">
                <Card className="bg-spotify-gray border-spotify-lightgray/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-spotify-green">
                      <Car className="h-5 w-5" />
                      運転のコツ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white">{planData.tips.driving}</p>
                  </CardContent>
                </Card>

                <Card className="bg-spotify-gray border-spotify-lightgray/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-spotify-green">
                      <Lightbulb className="h-5 w-5" />
                      事前準備
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white">{planData.tips.preparation}</p>
                  </CardContent>
                </Card>

                <Card className="bg-spotify-gray border-spotify-lightgray/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-spotify-green">
                      <Wallet className="h-5 w-5" />
                      予算について
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white">{planData.tips.budget}</p>
                  </CardContent>
                </Card>

                <Card className="bg-spotify-gray border-spotify-lightgray/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-spotify-green">
                      <Sun className="h-5 w-5" />
                      天候について
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white">{planData.tips.weather}</p>
                  </CardContent>
                </Card>

                <Card className="bg-spotify-gray border-spotify-lightgray/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-spotify-green">
                      <AlertCircle className="h-5 w-5" />
                      安全について
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white">{planData.tips.safety}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
