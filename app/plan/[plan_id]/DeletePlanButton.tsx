"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface DeletePlanButtonProps {
  planId: string;
  planTitle: string;
}

export function DeletePlanButton({ planId, planTitle }: DeletePlanButtonProps) {
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
        
        // マイページにリダイレクト
        router.push("/mypage");
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
        {/* カード全体を暗くするオーバーレイ */}
        <div className="fixed inset-0 bg-black/30 z-40" onClick={handleCancel}></div>
        
        <div className="relative">
          {/* 削除ボタン */}
          <Button
            onClick={() => {}}
            disabled={true}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-red-400 border-red-400 opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            プランを削除
          </Button>
          
          {/* 確認ダイアログ（ボタンの下に表示） */}
          <div className="absolute top-full right-0 mt-2 bg-spotify-lightdark border border-red-500/30 rounded-lg p-4 shadow-2xl z-50 min-w-[300px]">
            <h3 className="text-sm font-semibold text-white mb-2">プランを削除</h3>
            <p className="text-white text-xs mb-4">
              「{planTitle}」を削除しますか？この操作は取り消せません。
            </p>
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
                {isDeleting ? "削除中..." : "削除する"}
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <Button
      onClick={handleDelete}
      disabled={isDeleting}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 text-red-400 border-red-400 hover:bg-red-900/20 hover:text-red-300"
    >
      <Trash2 className="h-4 w-4" />
      プランを削除
    </Button>
  );
}
