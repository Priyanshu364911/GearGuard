import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import type { Profile } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Clock, CheckCircle } from "lucide-react"

export default async function ReportsPage() {
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

  // Get requests by stage
  const { data: requestsByStage } = await supabase.from("maintenance_requests").select("stage")

  const stageCounts = {
    new: 0,
    in_progress: 0,
    repaired: 0,
    scrap: 0,
  }

  requestsByStage?.forEach((req) => {
    stageCounts[req.stage as keyof typeof stageCounts]++
  })

  // Get requests by team
  const { data: requestsByTeam } = await supabase.from("maintenance_requests").select(
    `
      id,
      teams(name)
    `,
  )

  const teamCounts: { [key: string]: number } = {}
  requestsByTeam?.forEach((req: any) => {
    if (req.teams) {
      const teamName = req.teams.name
      teamCounts[teamName] = (teamCounts[teamName] || 0) + 1
    }
  })

  // Get requests by equipment category
  const { data: requestsByCategory } = await supabase.from("maintenance_requests").select(
    `
      id,
      equipment_categories(name)
    `,
  )

  const categoryCounts: { [key: string]: number } = {}
  requestsByCategory?.forEach((req: any) => {
    if (req.equipment_categories) {
      const categoryName = req.equipment_categories.name
      categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1
    }
  })

  // Get requests by type
  const { data: requestsByType } = await supabase.from("maintenance_requests").select("request_type")

  const typeCounts = {
    corrective: 0,
    preventive: 0,
  }

  requestsByType?.forEach((req) => {
    typeCounts[req.request_type as keyof typeof typeCounts]++
  })

  // Get average completion time for repaired requests
  const { data: repairedRequests } = await supabase
    .from("maintenance_requests")
    .select("created_at, completed_date, duration_hours")
    .eq("stage", "repaired")
    .not("completed_date", "is", null)

  let avgCompletionTime = 0
  let avgDuration = 0

  if (repairedRequests && repairedRequests.length > 0) {
    const totalTime = repairedRequests.reduce((sum, req) => {
      const created = new Date(req.created_at).getTime()
      const completed = new Date(req.completed_date!).getTime()
      return sum + (completed - created) / (1000 * 60 * 60) // Convert to hours
    }, 0)

    avgCompletionTime = totalTime / repairedRequests.length

    const totalDuration = repairedRequests.reduce((sum, req) => sum + (req.duration_hours || 0), 0)
    avgDuration = totalDuration / repairedRequests.length
  }

  const totalRequests = requestsByStage?.length || 0
  const completionRate = totalRequests > 0 ? ((stageCounts.repaired / totalRequests) * 100).toFixed(1) : "0"

  return (
    <DashboardLayout user={profile as Profile}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Reports</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Analytics and insights for maintenance operations</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalRequests}</div>
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{completionRate}%</div>
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Avg. Completion Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{avgCompletionTime.toFixed(1)}h</div>
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                  <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Avg. Work Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{avgDuration.toFixed(1)}h</div>
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Requests by Stage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stageCounts).map(([stage, count]) => {
                  const percentage = totalRequests > 0 ? (count / totalRequests) * 100 : 0
                  const colors = {
                    new: "bg-blue-500",
                    in_progress: "bg-yellow-500",
                    repaired: "bg-green-500",
                    scrap: "bg-red-500",
                  }

                  return (
                    <div key={stage}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                          {stage.replace("_", " ")}
                        </span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors[stage as keyof typeof colors]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requests by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(typeCounts).map(([type, count]) => {
                  const percentage = totalRequests > 0 ? (count / totalRequests) * 100 : 0
                  const colors = {
                    corrective: "bg-amber-500",
                    preventive: "bg-emerald-500",
                  }

                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">{type}</span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors[type as keyof typeof colors]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requests by Team</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(teamCounts).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(teamCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([team, count]) => {
                      const percentage = totalRequests > 0 ? (count / totalRequests) * 100 : 0

                      return (
                        <div key={team}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-900 dark:text-white">{team}</span>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {count} ({percentage.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No team data available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requests by Equipment Category</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(categoryCounts).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(categoryCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([category, count]) => {
                      const percentage = totalRequests > 0 ? (count / totalRequests) * 100 : 0

                      return (
                        <div key={category}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-900 dark:text-white">{category}</span>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {count} ({percentage.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No category data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
