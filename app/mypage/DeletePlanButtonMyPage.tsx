"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface DeletePlanButtonMyPageProps {
  planId: string;
  planTitle: string;
  onDelete?: () => void;
}

export function DeletePlanButtonMyPage({ planId, planTitle, onDelete }: DeletePlanButtonMyPageProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch("/api/plan/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan_id: planId }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        toast({
          title: "削除完了",
          description: "プランが正常に削除されました。",
          variant: "default",
        });
        
        // 削除後のコールバック実行（ページリフレッシュなど）
        if (onDelete) {
          onDelete();
        } else {
          // フォールバックとしてページをリフレッシュ
          router.refresh();
        }
      } else {
        throw new Error(data.message || "削除に失敗しました");
      }
    } catch (error) {
      console.error("プラン削除エラー:", error);
      toast({
        title: "削除エラー",
        description: error instanceof Error ? error.message : "プランの削除に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <>
        {/* オーバーレイ */}
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-spotify-lightdark border border-red-500/30 rounded-lg p-4 shadow-2xl">
            <p className="text-white text-sm mb-3">削除しますか？</p>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={handleCancel}
                disabled={isDeleting}
                variant="outline"
                size="sm"
                className="text-white border-spotify-lightgray hover:bg-spotify-gray text-xs px-2 py-1"
              >
                キャンセル
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                variant="destructive"
                size="sm"
                className="flex items-center gap-1 text-xs px-2 py-1"
              >
                {isDeleting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
                {isDeleting ? "削除中..." : "削除"}
              </Button>
            </div>
          </div>
        </div>
        {/* 元のボタンも表示 */}
        <Button
          onClick={() => {}}
          disabled={true}
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 p-1 h-8 w-8 text-red-400 opacity-30"
          aria-label={`${planTitle}を削除`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </>
    );
  }

  return (
    <Button
      onClick={handleDelete}
      disabled={isDeleting}
      variant="ghost"
      size="sm"
      className="absolute top-2 right-2 p-1 h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
      aria-label={`${planTitle}を削除`}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
