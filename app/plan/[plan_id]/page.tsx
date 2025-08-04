
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
const SpotifyPlaylistClient = dynamic(() => import("./SpotifyPlaylistClient").then(mod => mod.SpotifyPlaylistClient));
const DeletePlanButton = dynamic(() => import("./DeletePlanButton").then(mod => mod.DeletePlanButton));

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


// サーバーコンポーネント本体
export default async function PlanDetailsPage({ params }: PlanDetailsPageProps) {
  const awaitedParams = await params;
  const supabase = await createClient();
  const { data: plan } = await supabase
    .from("plans")
    .select("*")
    .eq("id", awaitedParams.plan_id)
    .single();
  if (!plan || !isValidPlan(plan)) {
    notFound();
  }
  const planData = plan as Plan;
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-spotify-dark via-gray-900/20 to-spotify-dark text-white overflow-hidden">
      {/* 背景アニメーション */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-spotify-green/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* ヘッダーナビゲーション */}
      <header className="fixed top-0 left-0 right-0 w-full bg-spotify-dark/80 backdrop-blur-md border-b border-spotify-gray z-50" role="banner">
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

      <div className="flex-1 flex flex-col items-center p-4 pt-20 relative z-10">
        <Card className="w-full max-w-4xl bg-spotify-lightdark/80 backdrop-blur-md border-spotify-gray text-white shadow-2xl relative">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl font-bold text-spotify-green">ドライブプラン詳細</CardTitle>
                <CardDescription className="text-spotify-lightgray">
                  AIが生成したあなたのドライブプランです。
                </CardDescription>
              </div>
              {/* 削除ボタンをカードの右上に配置 */}
              <div className="flex-shrink-0">
                <Suspense fallback={<div className="text-spotify-lightgray text-sm">読み込み中...</div>}>
                  <DeletePlanButton 
                    planId={planData.id} 
                    planTitle={`${planData.departure}から${planData.theme}のドライブプラン`}
                  />
                </Suspense>
              </div>
            </div>
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
              <TabsList className="grid w-full bg-spotify-gray overflow-x-auto" style={{ gridTemplateColumns: `repeat(${planData.route.length}, minmax(40px, 1fr))` }}>
                {planData.route.map((spot, index) => (
                  <TabsTrigger 
                    key={index} 
                    value={`spot-${index}`} 
                    className="data-[state=active]:bg-spotify-green text-xs px-2 py-1 whitespace-nowrap"
                  >
                    <span className="sm:hidden">{index + 1}</span>
                    <span className="hidden sm:inline">
                      {index + 1}. {spot.name.length > 8 ? spot.name.substring(0, 8) + '...' : spot.name}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {planData.route.map((spot, index) => (
                <TabsContent key={index} value={`spot-${index}`} className="space-y-4">
                  <Card className="bg-spotify-gray/50 backdrop-blur-sm border-spotify-lightgray/20">
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
            <SpotifyPlaylistClient playlist={planData.overall_spotify_playlist} planId={awaitedParams.plan_id} />
            
            {/* 曲順編集UI（クライアントコンポーネント） */}
            <Suspense fallback={<div>曲順エディタを読み込み中...</div>}>
              <PlaylistTracksEditor plan_id={awaitedParams.plan_id} />
            </Suspense>

            <Separator className="bg-spotify-gray" />

            {/* アドバイス（Spotifyプレイリストの下に移動） */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-spotify-green" />
                <h2 className="text-xl font-bold text-spotify-green">ドライブのアドバイス</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card className="bg-spotify-lightdark/80 backdrop-blur-sm border-spotify-lightgray/20 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-spotify-green text-sm">
                      <Car className="h-4 w-4" />
                      運転のコツ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-white text-sm">{planData.tips.driving}</p>
                  </CardContent>
                </Card>

                <Card className="bg-spotify-lightdark/80 backdrop-blur-sm border-spotify-lightgray/20 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-spotify-green text-sm">
                      <Lightbulb className="h-4 w-4" />
                      事前準備
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-white text-sm">{planData.tips.preparation}</p>
                  </CardContent>
                </Card>

                <Card className="bg-spotify-lightdark/80 backdrop-blur-sm border-spotify-lightgray/20 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-spotify-green text-sm">
                      <Wallet className="h-4 w-4" />
                      予算について
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-white text-sm">{planData.tips.budget}</p>
                  </CardContent>
                </Card>

                <Card className="bg-spotify-lightdark/80 backdrop-blur-sm border-spotify-lightgray/20 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-spotify-green text-sm">
                      <Sun className="h-4 w-4" />
                      天候について
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-white text-sm">{planData.tips.weather}</p>
                  </CardContent>
                </Card>

                <Card className="bg-spotify-lightdark/80 backdrop-blur-sm border-spotify-lightgray/20 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-spotify-green text-sm">
                      <AlertCircle className="h-4 w-4" />
                      安全について
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-white text-sm">{planData.tips.safety}</p>
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
