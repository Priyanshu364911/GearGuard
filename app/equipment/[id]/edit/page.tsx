import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import type { Profile } from "@/lib/types"
import { EquipmentForm } from "@/components/equipment-form"

export default async function EditEquipmentPage({ params }: { params: Promise<{ id: string }> }) {
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
    redirect("/equipment")
  }

  const { data: equipment } = await supabase.from("equipment").select("*").eq("id", id).single()

  if (!equipment) {
    redirect("/equipment")
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Edit Equipment</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Update equipment information</p>
        </div>
        <EquipmentForm
          categories={categories || []}
          teams={teams || []}
          technicians={technicians || []}
          equipment={equipment}
        />
      </div>
    </DashboardLayout>
  )
}
