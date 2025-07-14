"use client"

import { Button } from "@/components/ui/button"
import { supabaseClient } from "@/lib/supabase/client" // 修正: createClient() から supabaseClient へ
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useState } from "react"

export function GuestLoginButton() {
  const router = useRouter()
  // 修正: createClient() の呼び出しを削除し、直接 supabaseClient を使用
  const supabase = supabaseClient
  const [isLoading, setIsLoading] = useState(false)

  const handleGuestLogin = async () => {
    setIsLoading(true)
    try {
      // Generate a unique email for guest user
      const guestEmail = `guest_${Date.now()}@tunedrive.com`
      const guestPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

      const { data, error } = await supabase.auth.signUp({
        email: guestEmail,
        password: guestPassword,
        options: {
          data: {
            is_guest: true, // Custom flag for guest users
          },
        },
      })

      if (error) {
        console.error("Error signing up guest:", error)
        // Handle specific errors, e.g., if email already exists (unlikely with Date.now())
        // For simplicity, we'll just log and not redirect
      } else if (data.user) {
        console.log("Guest user signed up:", data.user.id)
        // After successful sign-up, refresh the router to ensure server components re-fetch session
        router.refresh()
        router.push("/plan/create") // Redirect to plan creation page
      }
    } catch (error) {
      console.error("Unexpected error during guest login:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleGuestLogin}
      disabled={isLoading}
      className="w-full bg-spotify-gray text-white hover:bg-spotify-lightdark"
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      ゲストとしてログイン
    </Button>
  )
}
