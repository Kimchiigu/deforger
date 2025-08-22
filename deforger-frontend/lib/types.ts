export interface UserProfile {
  id: string // Principal as string
  username: string
  name: string
  role: string
  skills: string[]
  portfolioUrl: string
}

export interface RoleRequirement {
  roleName: string
  requiredSkills: string[]
}

export interface Application {
  id: number
  applicant: string // Principal as string
  projectId: number
  message: string
  status: "pending" | "accepted" | "rejected"
}

export interface Project {
  id: number
  owner: string // Principal as string
  name: string
  vision: string
  team: string[] // Array of user principals
  openRoles: RoleRequirement[]
  applications: Application[]
  isTokenized: boolean
  totalShares: number
  availableShares: number
  pricePerShare: number
  shareBalances: [string, number][] // [userId, balance]
  type: "startup" | "project"
  reviews?: Review[]
}

export interface AgentMatch {
  matchId: number
  projectId: number
  userId: string // Principal as string
  roleFilled: string
  timestamp: string // ISO Date string
}

export interface ChatMessage {
  id: number
  projectId: number
  sender: string // Principal as string
  content: string
  timestamp: string // ISO Date string
}

export interface Review {
  id: string
  projectId: number
  reviewerId: string
  rating: number // 1-5 stars
  comment: string
  timestamp: string // ISO Date string
}
