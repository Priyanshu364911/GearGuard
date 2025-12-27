import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import type { Profile, MaintenanceRequest } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ClipboardList, Wrench, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
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

  // Get statistics
  const { count: equipmentCount } = await supabase.from("equipment").select("*", { count: "exact", head: true })

  const { count: activeRequestsCount } = await supabase
    .from("maintenance_requests")
    .select("*", { count: "exact", head: true })
    .in("stage", ["new", "in_progress"])

  const { count: newRequestsCount } = await supabase
    .from("maintenance_requests")
    .select("*", { count: "exact", head: true })
    .eq("stage", "new")

  const { count: teamsCount } = await supabase.from("teams").select("*", { count: "exact", head: true })

  // Get recent requests
  const { data: recentRequests } = await supabase
    .from("maintenance_requests")
    .select(
      `
      *,
      equipment(name),
      assigned_profile:profiles!maintenance_requests_assigned_to_fkey(full_name, email)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(5)

  const stats = [
    {
      title: "Total Equipment",
      value: equipmentCount || 0,
      icon: Package,
      color: "bg-blue-500",
      href: "/equipment",
    },
    {
      title: "Active Requests",
      value: activeRequestsCount || 0,
      icon: ClipboardList,
      color: "bg-green-500",
      href: "/requests",
    },
    {
      title: "New Requests",
      value: newRequestsCount || 0,
      icon: AlertTriangle,
      color: "bg-orange-500",
      href: "/requests?stage=new",
    },
    {
      title: "Teams",
      value: teamsCount || 0,
      icon: Wrench,
      color: "bg-purple-500",
      href: "/teams",
    },
  ]

  return (
    <DashboardLayout user={profile as Profile}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back, {profile.full_name || profile.email}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.title}</CardTitle>
                  <div className={`${stat.color} p-2 rounded-lg`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Maintenance Requests</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/requests">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentRequests && recentRequests.length > 0 ? (
              <div className="space-y-4">
                {recentRequests.map((request) => {
                  const typedRequest = request as MaintenanceRequest & {
                    equipment: { name: string }
                    assigned_profile: { full_name: string; email: string } | null
                  }
                  return (
                    <Link
                      key={typedRequest.id}
                      href={`/requests/${typedRequest.id}`}
                      className="flex items-start justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900 dark:text-white">{typedRequest.subject}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Equipment: {typedRequest.equipment?.name || "Unknown"}
                        </p>
                        {typedRequest.assigned_profile && (
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Assigned to:{" "}
                            {typedRequest.assigned_profile.full_name || typedRequest.assigned_profile.email}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            typedRequest.stage === "new"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : typedRequest.stage === "in_progress"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : typedRequest.stage === "repaired"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {typedRequest.stage.replace("_", " ")}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(typedRequest.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">No recent requests</div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
