import { ApiResponse, CreatePlanRequest, CreatePlanResponse } from "@/types";
import { API_ENDPOINTS, ERROR_MESSAGES } from "@/constants";
import { getErrorMessage } from "./validation";

/**
 * APIエラーレスポンスを作成する
 */
export function createErrorResponse(message: string, status: number): Response {
  return new Response(
    JSON.stringify({
      message,
      status: "error",
      timestamp: new Date().toISOString()
    }),
    { 
      status,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
}

/**
 * API成功レスポンスを作成する
 */
export function createSuccessResponse<T>(data: T, status: number = 200): Response {
  return new Response(
    JSON.stringify({
      data,
      status: "success",
      timestamp: new Date().toISOString()
    }),
    { 
      status,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
}

/**
 * プラン作成APIを呼び出す
 */
export async function createPlan(planData: CreatePlanRequest): Promise<CreatePlanResponse> {
  try {
    const response = await fetch(API_ENDPOINTS.PLAN_CREATE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(planData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || ERROR_MESSAGES.PLAN_CREATION_FAILED);
    }

    return await response.json();
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * リクエストボディを安全に解析する
 */
export async function parseRequestBody<T>(request: Request): Promise<T> {
  try {
    return await request.json();
  } catch {
    throw new Error("リクエストボディが無効です");
  }
}

/**
 * 環境変数の存在をチェックする（開発環境のみ）
 */
export function checkEnvironmentVariables(): void {
  if (process.env.NODE_ENV === 'development') {
    const requiredEnvVars = [
      'SUPABASE_JWT_SECRET',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];

    requiredEnvVars.forEach(envVar => {
      console.log(
        `${envVar}:`,
        process.env[envVar] ? "読み込み済み" : "未設定または空"
      );
    });
  }
}

/**
 * ユーザー情報をログ出力する（開発環境のみ）
 */
export function logUserInfo(user: any): void {
  if (process.env.NODE_ENV === 'development') {
    console.log("User in API route:", user ? user.id : "認証されていません");
  }
}
