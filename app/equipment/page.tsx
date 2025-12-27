import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import type { Profile, Equipment } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Search, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default async function EquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams

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

  let query = supabase
    .from("equipment")
    .select(
      `
      *,
      equipment_categories(name),
      teams(name),
      profiles(full_name, email)
    `,
    )
    .order("created_at", { ascending: false })

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,serial_number.ilike.%${params.search}%`)
  }

  if (params.status) {
    query = query.eq("status", params.status)
  }

  const { data: equipment } = await query

  return (
    <DashboardLayout user={profile as Profile}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Equipment</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your company assets</p>
          </div>
          <Button asChild>
            <Link href="/equipment/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Equipment
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>All Equipment</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input placeholder="Search equipment..." className="pl-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {equipment && equipment.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {equipment.map((item) => {
                  const typedItem = item as Equipment & {
                    equipment_categories: { name: string } | null
                    teams: { name: string } | null
                    profiles: { full_name: string; email: string } | null
                  }
                  return (
                    <Link key={typedItem.id} href={`/equipment/${typedItem.id}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">{typedItem.name}</h3>
                                {typedItem.serial_number && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    SN: {typedItem.serial_number}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Badge
                              variant={
                                typedItem.status === "active"
                                  ? "default"
                                  : typedItem.status === "maintenance"
                                    ? "secondary"
                                    : "destructive"
                              }
                              className="capitalize"
                            >
                              {typedItem.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          {typedItem.equipment_categories && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 dark:text-slate-400">Category:</span>
                              <span className="text-slate-900 dark:text-white">
                                {typedItem.equipment_categories.name}
                              </span>
                            </div>
                          )}
                          {typedItem.teams && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 dark:text-slate-400">Team:</span>
                              <span className="text-slate-900 dark:text-white">{typedItem.teams.name}</span>
                            </div>
                          )}
                          {typedItem.location && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 dark:text-slate-400">Location:</span>
                              <span className="text-slate-900 dark:text-white">{typedItem.location}</span>
                            </div>
                          )}
                          {typedItem.department && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 dark:text-slate-400">Department:</span>
                              <span className="text-slate-900 dark:text-white">{typedItem.department}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No equipment found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Get started by adding your first equipment
                </p>
                <Button asChild>
                  <Link href="/equipment/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Equipment
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
