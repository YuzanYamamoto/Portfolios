// 共通の型定義
export interface User {
  id: string;
  email: string;
  is_guest?: boolean;
}

export interface Spot {
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

export interface Tips {
  driving: string;
  preparation: string;
  budget: string;
  weather: string;
  safety: string;
}

export interface SpotifyPlaylist {
  title: string;
  description: string;
  url: string;
  tracks?: SpotifyTrack[];
}

export interface SpotifyTrack {
  title: string;
  artist: string;
  reason: string;
}

export interface Plan {
  id: string;
  user_id: string;
  departure: string;
  theme: string;
  music_genre?: string;
  route: Spot[];
  tips: Tips;
  created_at: string;
  total_duration?: string;
  total_distance?: string;
  best_season?: string;
  difficulty_level?: string;
  recommended_start_time?: string;
  alternative_spots?: AlternativeSpot[];
  local_specialties?: string[];
  photo_spots?: string[];
  overall_spotify_playlist?: SpotifyPlaylist;
  spotify_playlist_id?: string;
}

export interface AlternativeSpot {
  name: string;
  reason: string;
}

export interface CreatePlanRequest {
  departure: string;
  duration: string;
  companion: string;
  theme: string;
  musicGenre?: string;
}

export interface CreatePlanResponse {
  plan_id: string;
  status: 'success' | 'error';
  timestamp: string;
  message?: string;
}

// フォームのバリデーションエラー
export interface FormErrors {
  [key: string]: string;
}

// API レスポンスの基本型
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: 'success' | 'error';
  timestamp: string;
}
