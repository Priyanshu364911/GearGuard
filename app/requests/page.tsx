import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import type { Profile } from "@/lib/types"
import { KanbanBoard } from "@/components/kanban-board"

export default async function RequestsPage() {
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

  // Fetch all maintenance requests with relationships
  const { data: requests } = await supabase
    .from("maintenance_requests")
    .select(
      `
      *,
      equipment(id, name, serial_number),
      equipment_categories(id, name),
      teams(id, name),
      assigned_profile:profiles!maintenance_requests_assigned_to_fkey(id, full_name, email, avatar_url),
      requester_profile:profiles!maintenance_requests_requested_by_fkey(id, full_name, email)
    `,
    )
    .order("created_at", { ascending: false })

  // Fetch equipment list for creating new requests
  const { data: equipment } = await supabase.from("equipment").select(
    `
      *,
      equipment_categories(id, name),
      teams(id, name)
    `,
  )

  // Fetch teams and technicians for assignment
  const { data: teams } = await supabase.from("teams").select("*")

  const { data: technicians } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["technician", "manager", "admin"])

  return (
    <DashboardLayout user={profile as Profile}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Maintenance Requests</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track and manage all maintenance work</p>
        </div>

        <KanbanBoard
          initialRequests={requests || []}
          equipment={equipment || []}
          teams={teams || []}
          technicians={technicians || []}
          currentUser={profile as Profile}
        />
      </div>
    </DashboardLayout>
  )
}
