import { FormErrors } from "@/types";
import { ERROR_MESSAGES } from "@/constants";

/**
 * 入力値をサニタイズする
 */
export function sanitizeInput(input: string, maxLength: number = 200): string {
  return input
    .replace(/[<>"']/g, '') // HTMLタグや引用符を除去
    .replace(/javascript:/gi, '') // JavaScriptプロトコルを除去
    .trim()
    .substring(0, maxLength);
}

/**
 * プラン作成フォームのバリデーション
 */
export function validatePlanForm(data: {
  departure: string;
  duration: string;
  companion: string;
  theme: string;
}): FormErrors {
  const errors: FormErrors = {};
  
  if (!data.departure.trim()) {
    errors.departure = "出発地を入力してください";
  }
  
  if (!data.duration) {
    errors.duration = "所要時間を選択してください";
  }
  
  if (!data.companion) {
    errors.companion = "同行者を選択してください";
  }
  
  if (!data.theme.trim()) {
    errors.theme = "ドライブのテーマを入力してください";
  }
  
  return errors;
}

/**
 * エラーオブジェクトからメッセージを安全に取得する
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string") {
      return message;
    }
  }
  
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * 必須フィールドの完了状態をチェック
 */
export function getCompletedFields(data: {
  departure: string;
  duration: string;
  companion: string;
  theme: string;
  musicGenre?: string;
}): Set<string> {
  const completed = new Set<string>();
  
  if (data.departure.trim()) completed.add('departure');
  if (data.duration) completed.add('duration');
  if (data.companion) completed.add('companion');
  if (data.theme.trim()) completed.add('theme');
  if (data.musicGenre) completed.add('musicGenre');
  
  return completed;
}

/**
 * フォームの進捗率を計算（必須フィールドのみ）
 */
export function calculateFormProgress(completedFields: Set<string>): number {
  const requiredFieldsCount = 4; // departure, duration, companion, theme
  return (completedFields.size / requiredFieldsCount) * 100;
}
