"use client"


import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { FcGoogle } from "react-icons/fc" // Using react-icons for Google icon

export function AuthButton() {
  const router = useRouter()
  const supabase = createClient()
  const [rememberMe, setRememberMe] = useState(true)

  const handleSignIn = async () => {
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
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      console.error("Error signing in with Google:", error)
      // Optionally, show a toast or alert to the user
    } else if (data.url) {
      router.push(data.url) // Redirect to Google's OAuth page
    }
  }

  return (
    <div>
      <Button onClick={handleSignIn} className="w-full bg-white text-black hover:bg-gray-100 border border-gray-300">
        <FcGoogle className="mr-2 h-5 w-5" />
        Googleでログイン
      </Button>
    </div>
  )
}
