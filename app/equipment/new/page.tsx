import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import type { Profile } from "@/lib/types"
import { EquipmentForm } from "@/components/equipment-form"

export default async function NewEquipmentPage() {
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

  // Fetch categories, teams, and technicians for the form
  const { data: categories } = await supabase.from("equipment_categories").select("*").order("name")

  const { data: teams } = await supabase.from("teams").select("*").order("name")

  const { data: technicians } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["technician", "manager", "admin"])
    .order("full_name")

  return (
    <DashboardLayout user={profile as Profile}>
      <div className="max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Add Equipment</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Register a new asset in the system</p>
        </div>
        <EquipmentForm categories={categories || []} teams={teams || []} technicians={technicians || []} />
      </div>
    </DashboardLayout>
  )
}
