"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import {
  Wrench,
  LayoutDashboard,
  Package,
  Users,
  ClipboardList,
  Calendar,
  BarChart3,
  Menu,
  LogOut,
  User,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface DashboardLayoutProps {
  children: React.ReactNode
  user: Profile
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Equipment", href: "/equipment", icon: Package },
    { name: "Teams", href: "/teams", icon: Users },
    { name: "Requests", href: "/requests", icon: ClipboardList },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Reports", href: "/reports", icon: BarChart3 },
  ]

  const NavLinks = () => (
    <>
      {navigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        )
      })}
    </>
  )

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:block">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6 dark:border-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">GearGuard</span>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            <NavLinks />
          </nav>
          <div className="border-t border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {user.full_name || user.email}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
          <div className="flex items-center gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex h-full flex-col">
                  <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6 dark:border-slate-800">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                      <Wrench className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold">GearGuard</span>
                  </div>
                  <nav className="flex-1 space-y-1 p-4">
                    <NavLinks />
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <Wrench className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">GearGuard</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                  <User className="h-4 w-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user.full_name || user.email}</span>
                  <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Desktop Header */}
        <header className="hidden h-16 items-center justify-between border-b border-slate-200 bg-white px-8 dark:border-slate-800 dark:bg-slate-900 lg:flex">
          <div />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                  <User className="h-4 w-4" />
                </div>
                <span className="text-sm">{user.full_name || user.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user.full_name || user.email}</span>
                  <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
