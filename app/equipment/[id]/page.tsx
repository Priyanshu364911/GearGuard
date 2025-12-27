import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import type { Profile, Equipment, MaintenanceRequest } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Package, Edit, Wrench, Calendar, MapPin, Building2, User } from "lucide-react"

export default async function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  if (!profile) {
    redirect("/auth/login")
  }

  // Fetch equipment details
  const { data: equipment } = await supabase
    .from("equipment")
    .select(
      `
      *,
      equipment_categories(id, name),
      teams(id, name),
      profiles(id, full_name, email)
    `,
    )
    .eq("id", id)
    .single()

  if (!equipment) {
    redirect("/equipment")
  }

  // Fetch maintenance requests for this equipment (Smart Button feature)
  const { data: requests } = await supabase
    .from("maintenance_requests")
    .select(
      `
      *,
      assigned_profile:profiles!maintenance_requests_assigned_to_fkey(id, full_name, email)
    `,
    )
    .eq("equipment_id", id)
    .order("created_at", { ascending: false })

  const openRequestsCount = requests?.filter((r) => r.stage !== "repaired" && r.stage !== "scrap").length || 0

  const typedEquipment = equipment as Equipment & {
    equipment_categories: { id: string; name: string } | null
    teams: { id: string; name: string } | null
    profiles: { id: string; full_name: string; email: string } | null
  }

  return (
    <DashboardLayout user={profile as Profile}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/equipment">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Equipment
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{typedEquipment.name}</h1>
            {typedEquipment.serial_number && (
              <p className="text-slate-500 dark:text-slate-400">SN: {typedEquipment.serial_number}</p>
            )}
            <Badge
              variant={
                typedEquipment.status === "active"
                  ? "default"
                  : typedEquipment.status === "maintenance"
                    ? "secondary"
                    : "destructive"
              }
              className="capitalize mt-2"
            >
              {typedEquipment.status}
            </Badge>
          </div>
          {["admin", "manager"].includes(profile.role) && (
            <Button asChild>
              <Link href={`/equipment/${id}/edit`}>
                <Edit className="h-4 w-4 mr-1" />
                Edit Equipment
              </Link>
            </Button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {typedEquipment.equipment_categories && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Category</h3>
                    <p className="text-slate-900 dark:text-white">{typedEquipment.equipment_categories.name}</p>
                  </div>
                )}

                {typedEquipment.location && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Location
                    </h3>
                    <p className="text-slate-900 dark:text-white">{typedEquipment.location}</p>
                  </div>
                )}

                {typedEquipment.department && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      Department
                    </h3>
                    <p className="text-slate-900 dark:text-white">{typedEquipment.department}</p>
                  </div>
                )}

                {typedEquipment.assigned_employee && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Assigned Employee</h3>
                    <p className="text-slate-900 dark:text-white">{typedEquipment.assigned_employee}</p>
                  </div>
                )}

                {typedEquipment.purchase_date && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Purchase Date
                    </h3>
                    <p className="text-slate-900 dark:text-white">
                      {new Date(typedEquipment.purchase_date).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {typedEquipment.warranty_expiry && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Warranty Expiry</h3>
                    <p className="text-slate-900 dark:text-white">
                      {new Date(typedEquipment.warranty_expiry).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {typedEquipment.notes && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Notes</h3>
                    <p className="text-slate-900 dark:text-white whitespace-pre-wrap">{typedEquipment.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {typedEquipment.teams && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Maintenance Team</h3>
                    <Link
                      href={`/teams/${typedEquipment.teams.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                        <Wrench className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <p className="font-medium text-slate-900 dark:text-white">{typedEquipment.teams.name}</p>
                    </Link>
                  </div>
                )}

                {typedEquipment.profiles && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Assigned Technician</h3>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                        <User className="h-5 w-5" />
                      </div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {typedEquipment.profiles.full_name || typedEquipment.profiles.email}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Smart Button: Maintenance Requests */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Maintenance Requests</CardTitle>
                  <Badge variant="secondary">{openRequestsCount} open</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={`/requests?equipment=${id}`}>
                    <Package className="h-4 w-4 mr-2" />
                    View All Requests ({requests?.length || 0})
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {requests && requests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {requests.slice(0, 5).map((request) => {
                  const typedRequest = request as MaintenanceRequest & {
                    assigned_profile: { id: string; full_name: string; email: string } | null
                  }

                  const stageColors = {
                    new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                    in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                    repaired: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                    scrap: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
                  }

                  return (
                    <Link
                      key={typedRequest.id}
                      href={`/requests/${typedRequest.id}`}
                      className="flex items-start justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900 dark:text-white">{typedRequest.subject}</p>
                        {typedRequest.assigned_profile && (
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Assigned to:{" "}
                            {typedRequest.assigned_profile.full_name || typedRequest.assigned_profile.email}
                          </p>
                        )}
                      </div>
                      <Badge className={stageColors[typedRequest.stage]}>{typedRequest.stage.replace("_", " ")}</Badge>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
