import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MapPin, Clock, Lightbulb, Eye, Sun, Car, Wallet, Music, Calendar, Route, AlertCircle, Camera, MapIcon, ExternalLink } from "lucide-react"
import Link from "next/link"
import { User } from "lucide-react"
import { Suspense } from "react"

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
}

const isValidSpot = (spot: any): spot is Spot => {
  return spot &&
         typeof spot.name === 'string' &&
         typeof spot.description === 'string' &&
         typeof spot.stay_minutes === 'number' &&
         typeof spot.address === 'string';
}

const getMapsApiKey = (): string | null => {
  const apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;
  if (!apiKey) {
    console.error("Google Maps API key is not configured");
    return null;
  }
  return apiKey;
}

export async function generateMetadata({ params }: PlanDetailsPageProps): Promise<Metadata> {
  try {
    const { plan_id } = params;
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
              href={playlist.url.replace('/embed/', '/playlist/')} 
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
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-lg"
              title={`Spotifyプレイリスト: ${playlist.title}`}
            />
          </div>
        </Suspense>
      </div>
      <Separator className="bg-spotify-gray" />
    </>
  );
};

const RouteTab = ({ spot, index, apiKey }: { spot: Spot, index: number, apiKey: string | null }) => {
  if (!isValidSpot(spot)) {
    return (
      <div className="bg-spotify-gray p-4 rounded-lg shadow-lg mt-4 border border-spotify-lightgray/20">
        <p className="text-red-400">スポット情報が正しく読み込めませんでした</p>
      </div>
    );
  }

  return (
    <TabsContent value={String(index)}>
      <div className="bg-spotify-gray p-4 rounded-lg shadow-lg mt-4 border border-spotify-lightgray/20">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-2xl font-bold text-spotify-green">{spot.name}</h3>
          {spot.category && (
            <Badge variant="secondary" className="bg-spotify-lightdark text-spotify-lightgray">
              {spot.category}
            </Badge>
          )}
        </div>
        <p className="text-spotify-lightgray leading-relaxed mb-3">{spot.description}</p>
        
        {/* 住所情報 */}
        {spot.address && (
          <div className="mb-3">
            <p className="text-sm text-spotify-lightgray">
              <MapPin className="inline h-4 w-4 mr-1 text-spotify-green" />
              {spot.address}
            </p>
          </div>
        )}
        
        {/* 基本情報を横並びに */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-spotify-lightgray text-sm mt-3 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-spotify-green" />
            <span>滞在目安: {spot.stay_minutes}分</span>
          </div>
          {spot.best_time && (
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-spotify-green" />
              <span>おすすめ時間帯: {spot.best_time}</span>
            </div>
          )}
        </div>

        {/* 見どころ */}
        {spot.highlights && spot.highlights.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-spotify-green" />
              <span className="text-sm font-semibold text-spotify-green">見どころ</span>
            </div>
            <div className="bg-spotify-lightdark p-3 rounded-md border border-spotify-lightgray/10">
              <ul className="space-y-1" role="list">
                {spot.highlights.map((highlight: string, idx: number) => (
                  <li key={idx} className="text-sm text-spotify-lightgray flex items-start gap-2">
                    <span className="text-spotify-green text-xs mt-1" aria-hidden="true">•</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 駐車場情報 */}
        {spot.parking_info && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Car className="h-4 w-4 text-spotify-green" />
              <span className="text-sm font-semibold text-spotify-green">駐車場情報</span>
            </div>
            <div className="bg-spotify-lightdark p-3 rounded-md border border-spotify-lightgray/10">
              <p className="text-sm text-spotify-lightgray">{spot.parking_info}</p>
            </div>
          </div>
        )}

        {/* 予算 */}
        {spot.budget_range && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-spotify-green" />
              <span className="text-sm font-semibold text-spotify-green">予算目安</span>
            </div>
            <div className="bg-spotify-lightdark p-3 rounded-md border border-spotify-lightgray/10">
              <p className="text-sm text-spotify-lightgray">{spot.budget_range}</p>
            </div>
          </div>
        )}

        {/* 写真撮影のポイント */}
        {spot.photo_prompt && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Camera className="h-4 w-4 text-spotify-green" />
              <span className="text-sm font-semibold text-spotify-green">写真撮影のポイント</span>
            </div>
            <div className="bg-spotify-lightdark p-3 rounded-md border border-spotify-lightgray/10">
              <p className="text-sm text-spotify-lightgray">{spot.photo_prompt}</p>
            </div>
          </div>
        )}

        {/* Google Map 埋め込み */}
        <GoogleMapEmbed spot={spot} apiKey={apiKey} />
      </div>
    </TabsContent>
  );
};

export default async function PlanDetailsPage({ params }: PlanDetailsPageProps) {
  const { plan_id } = params;
  
  if (!plan_id || typeof plan_id !== 'string') {
    notFound();
  }

  const supabase = await createClient();
  const apiKey = getMapsApiKey();

  try {
    const { data: plan, error } = await supabase
      .from("plans")
      .select(`
        id, departure, theme, route, tips, created_at,
        total_duration, total_distance, best_season, difficulty_level,
        recommended_start_time, alternative_spots, local_specialties,
        photo_spots, overall_spotify_playlist
      `)
      .eq("id", plan_id)
      .single();

    if (error) {
      console.error("Error fetching plan:", error);
      if (error.code === 'PGRST116') {
        notFound(); // レコードが存在しない場合
      }
      throw new Error('プランの取得に失敗しました');
    }

    if (!plan || !isValidPlan(plan)) {
      console.error("Invalid plan data structure:", plan);
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
                  <Button className="bg-spotify-green text-white hover:bg-spotify-green/90">
                    プランを作成
                  </Button>
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
              {/* 出発地・テーマ */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-spotify-green" aria-hidden="true" />
                  <span className="text-lg font-semibold">出発地: {planData.departure}</span>
                </div>
                <Badge className="bg-spotify-green text-white text-md px-3 py-1">テーマ: {planData.theme}</Badge>
              </div>

              <Separator className="bg-spotify-gray" />

              {/* 基本情報セクション */}
              {(planData.total_duration || planData.total_distance || planData.recommended_start_time) && (
                <>
                  <h2 className="text-2xl font-bold text-spotify-green">プラン概要</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {planData.total_duration && (
                      <div className="flex items-center gap-2 bg-spotify-gray p-3 rounded-lg">
                        <Clock className="h-5 w-5 text-spotify-green" aria-hidden="true" />
                        <div>
                          <p className="text-sm text-spotify-lightgray">総所要時間</p>
                          <p className="font-semibold">{planData.total_duration}</p>
                        </div>
                      </div>
                    )}
                    {planData.total_distance && (
                      <div className="flex items-center gap-2 bg-spotify-gray p-3 rounded-lg">
                        <Route className="h-5 w-5 text-spotify-green" aria-hidden="true" />
                        <div>
                          <p className="text-sm text-spotify-lightgray">総距離</p>
                          <p className="font-semibold">{planData.total_distance}</p>
                        </div>
                      </div>
                    )}
                    {planData.recommended_start_time && (
                      <div className="flex items-center gap-2 bg-spotify-gray p-3 rounded-lg">
                        <Sun className="h-5 w-5 text-spotify-green" aria-hidden="true" />
                        <div>
                          <p className="text-sm text-spotify-lightgray">推奨出発時間</p>
                          <p className="font-semibold">{planData.recommended_start_time}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <Separator className="bg-spotify-gray" />
                </>
              )}

              {/* ルートをタブで表示 */}
              <section aria-labelledby="route-heading">
                <div className="flex items-center gap-2 mb-4">
                  <MapIcon className="h-6 w-6 text-spotify-green" aria-hidden="true" />
                  <h2 id="route-heading" className="text-2xl font-bold text-spotify-green">ルート</h2>
                </div>
                <Tabs defaultValue="0" className="w-full">
                  <div className="overflow-x-auto">
                    <TabsList className="flex w-max min-w-full gap-2 p-1 bg-spotify-dark rounded-lg" role="tablist">
                      {planData.route.map((spot: Spot, index: number) => (
                        <TabsTrigger
                          key={index}
                          value={String(index)}
                          className="flex-shrink-0 px-3 py-2 rounded-md text-spotify-lightgray data-[state=active]:bg-spotify-green data-[state=active]:text-white transition-all duration-200 hover:bg-spotify-lightgray/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spotify-green focus-visible:ring-offset-2 focus-visible:ring-offset-spotify-dark text-xs sm:text-sm whitespace-nowrap"
                          aria-label={`スポット${index + 1}: ${spot.name}`}
                          role="tab"
                        >
                          <span className="block sm:hidden">{index + 1}</span>
                          <span className="hidden sm:block">{index + 1}. {spot.name}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  {planData.route.map((spot: Spot, index: number) => (
                    <RouteTab key={index} spot={spot} index={index} apiKey={apiKey} />
                  ))}
                </Tabs>
              </section>

              <Separator className="bg-spotify-gray" />

              {/* 写真撮影スポット */}
              {planData.photo_spots && planData.photo_spots.length > 0 && (
                <section aria-labelledby="photo-spots-heading">
                  <div className="flex items-center gap-2 mb-4">
                    <Camera className="h-6 w-6 text-spotify-green" aria-hidden="true" />
                    <h2 id="photo-spots-heading" className="text-2xl font-bold text-spotify-green">写真撮影おすすめスポット</h2>
                  </div>
                  <div className="bg-spotify-gray p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {planData.photo_spots.map((spot: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <Camera className="h-4 w-4 text-spotify-green mt-1 flex-shrink-0" aria-hidden="true" />
                          <span className="text-sm text-spotify-lightgray">{spot}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator className="bg-spotify-gray" />
                </section>
              )}

              {/* 地域の特産品 */}
              {planData.local_specialties && planData.local_specialties.length > 0 && (
                <section aria-labelledby="specialties-heading">
                  <h2 id="specialties-heading" className="text-2xl font-bold text-spotify-green">地域の特産品・グルメ</h2>
                  <div className="bg-spotify-gray p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {planData.local_specialties.map((specialty: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-spotify-green text-sm" aria-hidden="true">🍽️</span>
                          <span className="text-sm text-spotify-lightgray">{specialty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator className="bg-spotify-gray" />
                </section>
              )}

              {/* Spotifyプレイリスト */}
              <SpotifyPlaylist playlist={planData.overall_spotify_playlist} />

              {/* ヒント */}
              <section aria-labelledby="tips-heading">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-6 w-6 text-spotify-green" aria-hidden="true" />
                  <h2 id="tips-heading" className="text-2xl font-bold text-spotify-green">旅のヒント</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {planData.tips && typeof planData.tips === "object" && !Array.isArray(planData.tips) &&
                    Object.entries(planData.tips).map(([key, tip]) => {
                      const icons = {
                        driving: Car,
                        preparation: AlertCircle,
                        budget: Wallet,
                        weather: Sun,
                        safety: AlertCircle
                      } as const;
                      
                      const Icon = icons[key as keyof typeof icons] || Lightbulb;
                      const titles = {
                        driving: "運転について",
                        preparation: "事前準備",
                        budget: "予算について",
                        weather: "天候について",
                        safety: "安全について"
                      };
                      
                      return (
                        <div key={key} className="bg-spotify-gray p-4 rounded-lg border border-spotify-lightgray/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="h-4 w-4 text-spotify-green" aria-hidden="true" />
                            <h3 className="font-semibold text-spotify-green text-sm">
                              {titles[key as keyof typeof titles] || key}
                            </h3>
                          </div>
                          <p className="text-sm text-spotify-lightgray leading-relaxed">{tip}</p>
                        </div>
                      );
                    })}
                </div>
              </section>

              {/* 作成日 */}
              <p className="text-sm text-spotify-lightgray text-right mt-4">
                作成日時: {new Date(planData.created_at).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  } catch (error) {
    console.error("Unexpected error in PlanDetailsPage:", error);
    throw error;
  }
}