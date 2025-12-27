import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import type { Profile } from "@/lib/types"
import { CalendarView } from "@/components/calendar-view"

export default async function CalendarPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Fetch all requests with scheduled dates
  const { data: requests } = await supabase
    .from("maintenance_requests")
    .select(
      `
      *,
      equipment(id, name),
      assigned_profile:profiles!maintenance_requests_assigned_to_fkey(id, full_name, email)
    `,
    )
    .not("scheduled_date", "is", null)
    .order("scheduled_date", { ascending: true })

  return (
    <DashboardLayout user={profile as Profile}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Calendar</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">View scheduled maintenance requests</p>
        </div>

        <CalendarView requests={requests || []} />
      </div>
    </DashboardLayout>
  )
}
