// アプリケーション全体で使用する定数

export const DURATION_OPTIONS = [
  { value: "30", label: "30分" },
  { value: "45", label: "45分" },
  { value: "60", label: "1時間" },
  { value: "75", label: "1時間15分" },
  { value: "90", label: "1時間30分" },
] as const;

export const COMPANION_OPTIONS = [
  { value: "一人", label: "一人" },
  { value: "家族", label: "家族" },
  { value: "友達", label: "友達" },
  { value: "恋人", label: "恋人" },
] as const;

export const THEME_EXAMPLES = [
  "自然", "グルメ", "歴史", "絶景", "温泉", 
  "アート", "海沿い", "山道", "街並み"
] as const;

export const MUSIC_GENRE_OPTIONS = [
  { value: "pop", label: "ポップス" },
  { value: "rock", label: "ロック" },
  { value: "jazz", label: "ジャズ" },
  { value: "classical", label: "クラシック" },
  { value: "electronic", label: "エレクトロニック" },
  { value: "hip-hop", label: "ヒップホップ" },
  { value: "r&b", label: "R&B" },
  { value: "country", label: "カントリー" },
  { value: "indie", label: "インディー" },
  { value: "alternative", label: "オルタナティブ" },
  { value: "folk", label: "フォーク" },
  { value: "reggae", label: "レゲエ" },
  { value: "latin", label: "ラテン" },
  { value: "k-pop", label: "K-POP" },
  { value: "j-pop", label: "J-POP" },
] as const;

// Spotify関連の定数
export const SPOTIFY_COLORS = {
  green: "#1DB954",
  dark: "#121212",
  lightdark: "#1A1A1A",
  gray: "#282828",
  lightgray: "#B3B3B3",
} as const;

// エラーメッセージ
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: "この項目は必須です",
  INVALID_INPUT: "入力値が無効です",
  NETWORK_ERROR: "ネットワークエラーが発生しました",
  UNAUTHORIZED: "認証が必要です",
  PLAN_CREATION_FAILED: "プランの作成に失敗しました",
  UNKNOWN_ERROR: "不明なエラーが発生しました",
} as const;

// 成功メッセージ
export const SUCCESS_MESSAGES = {
  PLAN_CREATED: "プランが正常に作成されました",
  LOGIN_SUCCESS: "ログインしました",
  LOGOUT_SUCCESS: "ログアウトしました",
} as const;

// アプリケーション設定
export const APP_CONFIG = {
  APP_NAME: "Tune Drive",
  APP_DESCRIPTION: "AI-powered drive planner with maps and playlists.",
  DEFAULT_LANGUAGE: "ja",
  MAX_INPUT_LENGTH: 200,
  REQUIRED_SPOTS_COUNT: 5,
  DEFAULT_PLAYLIST_TRACKS_COUNT: 15,
} as const;

// API エンドポイント
export const API_ENDPOINTS = {
  PLAN_CREATE: "/api/plan/create",
  SPOTIFY_AUTH: "/api/spotify/auth",
  SPOTIFY_CALLBACK: "/api/spotify/callback",
  SPOTIFY_PLAYLIST_CREATE: "/api/spotify/playlist/create",
  AUTH_CALLBACK: "/api/auth/callback",
} as const;

// ルート
export const ROUTES = {
  HOME: "/",
  PLAN_CREATE: "/plan/create",
  PLAN_DETAIL: "/plan/[plan_id]",
  MYPAGE: "/mypage",
} as const;
