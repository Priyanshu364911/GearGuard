import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import type { Profile } from "@/lib/types"
import { TeamForm } from "@/components/team-form"

export default async function EditTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || !["admin", "manager"].includes(profile.role)) {
    redirect("/teams")
  }

  const { data: team } = await supabase.from("teams").select("*").eq("id", id).single()

  if (!team) {
    redirect("/teams")
  }

  return (
    <DashboardLayout user={profile as Profile}>
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Edit Team</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Update team information</p>
        </div>
        <TeamForm team={team} />
      </div>
    </DashboardLayout>
  )
}
