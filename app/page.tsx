import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Wrench, ArrowRight, Package, Users, ClipboardList, Calendar } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is authenticated, redirect to dashboard
  if (user) {
    redirect("/dashboard")
  }

  const features = [
    {
      icon: Package,
      title: "Equipment Management",
      description: "Track all company assets with detailed information and maintenance history",
    },
    {
      icon: Users,
      title: "Team Organization",
      description: "Manage maintenance teams and assign technicians to equipment",
    },
    {
      icon: ClipboardList,
      title: "Request Tracking",
      description: "Create and track maintenance requests with kanban board workflow",
    },
    {
      icon: Calendar,
      title: "Scheduled Maintenance",
      description: "Plan preventive maintenance and view all scheduled work in a calendar",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">GearGuard</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-5xl font-bold text-slate-900 dark:text-white mb-6 text-balance">
            The Ultimate Maintenance Tracker
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 text-pretty">
            Streamline your maintenance operations with a comprehensive system for tracking equipment, managing teams,
            and organizing repair requests.
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/sign-up">
              Start Tracking Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900 mb-4">
                <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
