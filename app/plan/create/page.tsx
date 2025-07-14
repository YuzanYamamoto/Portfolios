import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import dynamic from "next/dynamic"

// Load the interactive form as a client component
const CreatePlanForm = dynamic(() => import("@/components/create-plan-form"), {
  ssr: false,
})

export default async function PlanCreatePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect guests to the landing page
  if (!user) redirect("/")

  return <CreatePlanForm />
}
