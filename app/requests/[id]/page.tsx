import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import type { Profile, MaintenanceRequest } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, User, Calendar, Clock, Package, AlertCircle } from "lucide-react"
import { UpdateRequestStageButton } from "@/components/update-request-stage-button"
import { AssignTechnicianDialog } from "@/components/assign-technician-dialog"

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Fetch request details
  const { data: request } = await supabase
    .from("maintenance_requests")
    .select(
      `
      *,
      equipment(id, name, serial_number, location),
      equipment_categories(id, name),
      teams(id, name),
      assigned_profile:profiles!maintenance_requests_assigned_to_fkey(id, full_name, email, role),
      requester_profile:profiles!maintenance_requests_requested_by_fkey(id, full_name, email)
    `,
    )
    .eq("id", id)
    .single()

  if (!request) {
    redirect("/requests")
  }

  // Fetch all technicians for assignment
  const { data: technicians } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["technician", "manager", "admin"])

  const typedRequest = request as MaintenanceRequest & {
    equipment: { id: string; name: string; serial_number: string | null; location: string | null } | null
    equipment_categories: { id: string; name: string } | null
    teams: { id: string; name: string } | null
    assigned_profile: { id: string; full_name: string; email: string; role: string } | null
    requester_profile: { id: string; full_name: string; email: string } | null
  }

  const isOverdue =
    typedRequest.scheduled_date &&
    new Date(typedRequest.scheduled_date) < new Date() &&
    typedRequest.stage !== "repaired" &&
    typedRequest.stage !== "scrap"

  const priorityColors = {
    low: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
    medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }

  const stageColors = {
    new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    repaired: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    scrap: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }

  return (
    <DashboardLayout user={profile as Profile}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/requests">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Requests
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{typedRequest.subject}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge className={stageColors[typedRequest.stage]}>{typedRequest.stage.replace("_", " ")}</Badge>
              <Badge className={priorityColors[typedRequest.priority]}>{typedRequest.priority}</Badge>
              <Badge variant="outline" className="capitalize">
                {typedRequest.request_type}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Overdue
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {typedRequest.description && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Description</h3>
                    <p className="text-slate-900 dark:text-white whitespace-pre-wrap">{typedRequest.description}</p>
                  </div>
                )}

                {typedRequest.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Notes</h3>
                    <p className="text-slate-900 dark:text-white whitespace-pre-wrap">{typedRequest.notes}</p>
                  </div>
                )}

                {typedRequest.equipment && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Equipment</h3>
                    <Link
                      href={`/equipment/${typedRequest.equipment.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                        <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{typedRequest.equipment.name}</p>
                        {typedRequest.equipment.serial_number && (
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            SN: {typedRequest.equipment.serial_number}
                          </p>
                        )}
                        {typedRequest.equipment.location && (
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Location: {typedRequest.equipment.location}
                          </p>
                        )}
                      </div>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {typedRequest.assigned_profile ? (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Assigned To</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {typedRequest.assigned_profile.full_name || typedRequest.assigned_profile.email}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                          {typedRequest.assigned_profile.role}
                        </p>
                      </div>
                    </div>
                    {["admin", "manager"].includes(profile.role) && (
                      <AssignTechnicianDialog
                        requestId={typedRequest.id}
                        technicians={technicians || []}
                        currentTechnicianId={typedRequest.assigned_profile.id}
                      />
                    )}
                  </div>
                ) : (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Assigned To</h3>
                    <p className="text-sm text-muted-foreground mb-2">Not assigned yet</p>
                    {["admin", "manager"].includes(profile.role) && (
                      <AssignTechnicianDialog
                        requestId={typedRequest.id}
                        technicians={technicians || []}
                        currentTechnicianId={null}
                      />
                    )}
                  </div>
                )}

                {typedRequest.requester_profile && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Requested By</h3>
                    <p className="text-slate-900 dark:text-white">
                      {typedRequest.requester_profile.full_name || typedRequest.requester_profile.email}
                    </p>
                  </div>
                )}

                {typedRequest.teams && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Team</h3>
                    <p className="text-slate-900 dark:text-white">{typedRequest.teams.name}</p>
                  </div>
                )}

                {typedRequest.scheduled_date && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Scheduled Date</h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <p className="text-slate-900 dark:text-white">
                        {new Date(typedRequest.scheduled_date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {typedRequest.duration_hours && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Duration</h3>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <p className="text-slate-900 dark:text-white">{typedRequest.duration_hours} hours</p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Created</h3>
                  <p className="text-sm text-slate-900 dark:text-white">
                    {new Date(typedRequest.created_at).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {(typedRequest.assigned_to === profile.id || ["admin", "manager"].includes(profile.role)) && (
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <UpdateRequestStageButton
                    requestId={typedRequest.id}
                    currentStage={typedRequest.stage}
                    nextStage="in_progress"
                  />
                  <UpdateRequestStageButton
                    requestId={typedRequest.id}
                    currentStage={typedRequest.stage}
                    nextStage="repaired"
                  />
                  <UpdateRequestStageButton
                    requestId={typedRequest.id}
                    currentStage={typedRequest.stage}
                    nextStage="scrap"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
