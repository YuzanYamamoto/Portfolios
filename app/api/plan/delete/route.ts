import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    
    // ユーザー認証の確認
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { message: "認証が必要です。", status: "error" },
        { status: 401 }
      );
    }

    // リクエストボディからplan_idを取得
    let requestBody;
    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json(
        { message: "リクエストボディが無効です。", status: "error" },
        { status: 400 }
      );
    }

    const { plan_id } = requestBody;

    if (!plan_id || typeof plan_id !== 'string') {
      return NextResponse.json(
        { message: "プランIDが必要です。", status: "error" },
        { status: 400 }
      );
    }

    // プランの存在確認（ユーザーが所有者かどうかも同時に確認）
    const { data: existingPlan, error: fetchError } = await supabase
      .from("plans")
      .select("id, user_id")
      .eq("id", plan_id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existingPlan) {
      return NextResponse.json(
        { message: "プランが見つからないか、削除する権限がありません。", status: "error" },
        { status: 404 }
      );
    }

    // プランを削除
    const { error: deleteError } = await supabase
      .from("plans")
      .delete()
      .eq("id", plan_id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("プランの削除中にエラーが発生しました:", deleteError);
      return NextResponse.json(
        { message: "プランの削除に失敗しました。", status: "error" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "プランが正常に削除されました。",
      status: "success",
      timestamp: new Date().toISOString()
    });

  } catch (error: unknown) {
    console.error("プラン削除API中にエラーが発生しました:", error);
    
    let errorMessage = "プランの削除中に不明なエラーが発生しました。";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { message: errorMessage, status: "error" },
      { status: 500 }
    );
  }
}
