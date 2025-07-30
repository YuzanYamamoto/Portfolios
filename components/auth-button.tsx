"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { FcGoogle } from "react-icons/fc"
import { API_ENDPOINTS } from "@/constants"

interface AuthButtonProps {
  className?: string;
  showRememberMe?: boolean;
}

export function AuthButton({ 
  className = "w-full bg-white text-black hover:bg-gray-100 border border-gray-300",
  showRememberMe = false 
}: AuthButtonProps) {
  const router = useRouter()
  const supabase = createClient()
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    setIsLoading(true)
    
    try {
      // チェックが無い場合、window.onunloadでサインアウト
      if (!rememberMe) {
        window.onunload = () => {
          supabase.auth.signOut()
        }
      } else {
        window.onunload = null
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${API_ENDPOINTS.AUTH_CALLBACK}`,
        },
      })

      if (error) {
        console.error("Error signing in with Google:", error)
        // TODO: トーストでエラーを表示
      } else if (data.url) {
        router.push(data.url)
      }
    } catch (error) {
      console.error("Unexpected error during sign in:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button 
        onClick={handleSignIn} 
        disabled={isLoading}
        className={className}
      >
        <FcGoogle className="mr-2 h-5 w-5" />
        {isLoading ? "ログイン中..." : "Googleでログイン"}
      </Button>
      
      {showRememberMe && (
        <div className="flex items-center space-x-2">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="remember-me" className="text-sm text-spotify-lightgray">
            ログイン状態を保持する
          </label>
        </div>
      )}
    </div>
  )
}
