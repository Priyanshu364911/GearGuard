export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: "admin" | "manager" | "technician"
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  created_at: string
  profiles?: Profile
  teams?: Team
}

export interface EquipmentCategory {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface Equipment {
  id: string
  name: string
  serial_number: string | null
  category_id: string | null
  team_id: string | null
  assigned_technician_id: string | null
  department: string | null
  assigned_employee: string | null
  purchase_date: string | null
  warranty_expiry: string | null
  location: string | null
  status: "active" | "maintenance" | "scrapped"
  notes: string | null
  created_at: string
  updated_at: string
  equipment_categories?: EquipmentCategory
  teams?: Team
  profiles?: Profile
}

export interface MaintenanceRequest {
  id: string
  subject: string
  description: string | null
  equipment_id: string
  category_id: string | null
  team_id: string | null
  assigned_to: string | null
  requested_by: string
  request_type: "corrective" | "preventive"
  stage: "new" | "in_progress" | "repaired" | "scrap"
  priority: "low" | "medium" | "high" | "urgent"
  scheduled_date: string | null
  completed_date: string | null
  duration_hours: number | null
  notes: string | null
  created_at: string
  updated_at: string
  equipment?: Equipment
  equipment_categories?: EquipmentCategory
  teams?: Team
  assigned_profile?: Profile
  requester_profile?: Profile
}
