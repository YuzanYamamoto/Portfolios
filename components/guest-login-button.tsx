"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { ROUTES, APP_CONFIG } from "@/constants"

interface GuestLoginButtonProps {
  className?: string;
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

export function GuestLoginButton({ 
  className = "w-full bg-spotify-gray text-white hover:bg-spotify-lightdark",
  onError,
  onSuccess
}: GuestLoginButtonProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)

  const generateGuestCredentials = () => {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    return {
      email: `guest_${timestamp}@${APP_CONFIG.APP_NAME.toLowerCase().replace(' ', '')}.com`,
      password: `${randomString}${Math.random().toString(36).substring(2, 15)}`
    }
  }

  const handleGuestLogin = async () => {
    setIsLoading(true)
    
    try {
      const { email, password } = generateGuestCredentials()

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            is_guest: true,
            display_name: "ゲストユーザー"
          },
        },
      })

      if (error) {
        console.error("Error signing up guest:", error)
        onError?.(error.message || "ゲストログインに失敗しました")
        return
      }

      if (data.user) {
        console.log("Guest user signed up:", data.user.id)
        onSuccess?.()
        router.push(ROUTES.PLAN_CREATE)
      }
    } catch (error) {
      console.error("Unexpected error during guest login:", error)
      const errorMessage = error instanceof Error ? error.message : "予期しないエラーが発生しました"
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleGuestLogin}
      disabled={isLoading}
      className={className}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading ? "ログイン中..." : "ゲストとしてログイン"}
    </Button>
  )
}
