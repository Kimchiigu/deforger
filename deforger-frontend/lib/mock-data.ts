import type { Project, UserProfile, AgentMatch, Application, ChatMessage, Review } from "./types"

export const mockUsers: UserProfile[] = [
  {
    id: "user_1",
    username: "deforger_admin",
    name: "DeForger Admin",
    role: "Full Stack Developer",
    skills: ["React", "TypeScript", "Node.js", "Web3", "AI/ML"],
    portfolioUrl: "https://github.com/deforger",
  },
  {
    id: "user_2",
    username: "alice_dev",
    name: "Alice Johnson",
    role: "Frontend Developer",
    skills: ["React", "Vue.js", "CSS", "JavaScript", "UI/UX"],
    portfolioUrl: "https://alice-portfolio.dev",
  },
  {
    id: "user_3",
    username: "bob_blockchain",
    name: "Bob Chen",
    role: "Blockchain Developer",
    skills: ["Solidity", "Web3", "Ethereum", "Smart Contracts", "DeFi"],
    portfolioUrl: "https://bobchen.crypto",
  },
  {
    id: "user_4",
    username: "carol_ai",
    name: "Carol Martinez",
    role: "AI Engineer",
    skills: ["Python", "TensorFlow", "PyTorch", "Machine Learning", "NLP"],
    portfolioUrl: "https://carol-ai.com",
  },
]

export const mockProjects: Project[] = [
  {
    id: 1,
    owner: "user_1",
    name: "DeFi Trading Platform",
    vision:
      "Revolutionary decentralized trading platform with AI-powered market analysis and automated portfolio management. Building the future of finance.",
    team: ["user_1", "user_3"],
    openRoles: [
      {
        roleName: "Frontend Developer",
        requiredSkills: ["React", "TypeScript", "Web3", "UI/UX"],
      },
      {
        roleName: "Smart Contract Developer",
        requiredSkills: ["Solidity", "Web3", "DeFi", "Security"],
      },
    ],
    applications: [
      {
        id: 1,
        applicant: "user_2",
        projectId: 1,
        message:
          "I have 5 years of React experience and am passionate about Web3. Would love to contribute to this innovative project.",
        status: "pending",
      },
    ],
    isTokenized: true,
    totalShares: 10000,
    availableShares: 7500,
    pricePerShare: 0.1,
    shareBalances: [
      ["user_1", 2000],
      ["user_3", 500],
    ],
    type: "startup",
    reviews: [
      {
        id: "review_1",
        projectId: 1,
        reviewerId: "user_2",
        rating: 5,
        comment: "Excellent project with strong technical foundation and clear vision. Great team to work with!",
        timestamp: "2024-01-10T14:30:00Z",
      },
      {
        id: "review_2",
        projectId: 1,
        reviewerId: "user_4",
        rating: 4,
        comment: "Innovative approach to DeFi. The AI integration is particularly impressive.",
        timestamp: "2024-01-08T09:15:00Z",
      },
    ],
  },
  {
    id: 2,
    owner: "user_2",
    name: "AI Content Generator",
    vision:
      "Next-generation AI platform for creating high-quality content across multiple formats. Empowering creators with intelligent automation.",
    team: ["user_2", "user_4"],
    openRoles: [
      {
        roleName: "Backend Developer",
        requiredSkills: ["Node.js", "Python", "API Design", "Database"],
      },
      {
        roleName: "DevOps Engineer",
        requiredSkills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
      },
    ],
    applications: [],
    isTokenized: false,
    totalShares: 0,
    availableShares: 0,
    pricePerShare: 0,
    shareBalances: [],
    type: "project",
  },
  {
    id: 3,
    owner: "user_3",
    name: "NFT Marketplace",
    vision:
      "Community-driven NFT marketplace with advanced discovery features and creator tools. Revolutionizing digital art ownership.",
    team: ["user_3"],
    openRoles: [
      {
        roleName: "Full Stack Developer",
        requiredSkills: ["React", "Node.js", "MongoDB", "Web3"],
      },
      {
        roleName: "UI/UX Designer",
        requiredSkills: ["Figma", "Design Systems", "User Research", "Prototyping"],
      },
    ],
    applications: [
      {
        id: 2,
        applicant: "user_1",
        projectId: 3,
        message: "Excited about this NFT project! I can bring both technical expertise and product vision.",
        status: "accepted",
      },
    ],
    isTokenized: true,
    totalShares: 5000,
    availableShares: 3000,
    pricePerShare: 0.25,
    shareBalances: [["user_3", 2000]],
    type: "startup",
    reviews: [
      {
        id: "review_3",
        projectId: 3,
        reviewerId: "user_1",
        rating: 4,
        comment: "Great concept and execution. The marketplace has a lot of potential in the NFT space.",
        timestamp: "2024-01-12T11:20:00Z",
      },
    ],
  },
  {
    id: 4,
    owner: "user_4",
    name: "Decentralized Social Network",
    vision:
      "Privacy-first social platform built on blockchain technology. Giving users control over their data and digital identity.",
    team: ["user_4"],
    openRoles: [
      {
        roleName: "Blockchain Developer",
        requiredSkills: ["Solidity", "IPFS", "Web3", "Cryptography"],
      },
      {
        roleName: "Mobile Developer",
        requiredSkills: ["React Native", "iOS", "Android", "Mobile UI"],
      },
    ],
    applications: [],
    isTokenized: false,
    totalShares: 0,
    availableShares: 0,
    pricePerShare: 0,
    shareBalances: [],
    type: "project",
  },
]

export const mockAgentMatches: AgentMatch[] = [
  {
    matchId: 1,
    projectId: 1,
    userId: "user_2",
    roleFilled: "Frontend Developer",
    timestamp: "2024-01-15T10:30:00Z",
  },
  {
    matchId: 2,
    projectId: 3,
    userId: "user_1",
    roleFilled: "Full Stack Developer",
    timestamp: "2024-01-14T14:20:00Z",
  },
  {
    matchId: 3,
    projectId: 2,
    userId: "user_4",
    roleFilled: "AI Engineer",
    timestamp: "2024-01-13T09:15:00Z",
  },
  {
    matchId: 4,
    projectId: 4,
    userId: "user_3",
    roleFilled: "Blockchain Developer",
    timestamp: "2024-01-12T16:45:00Z",
  },
]

export const mockChatMessages: ChatMessage[] = [
  {
    id: 1,
    projectId: 1,
    sender: "user_1",
    content: "Welcome to the DeFi Trading Platform team chat! Let's build something amazing together.",
    timestamp: "2024-01-15T09:00:00Z",
  },
  {
    id: 2,
    projectId: 1,
    sender: "user_3",
    content: "Excited to be part of this project! What should we tackle first?",
    timestamp: "2024-01-15T09:15:00Z",
  },
  {
    id: 3,
    projectId: 1,
    sender: "user_1",
    content:
      "Great question! I think we should start with the smart contract architecture and then move to the frontend. What do you all think?",
    timestamp: "2024-01-15T09:30:00Z",
  },
  {
    id: 4,
    projectId: 2,
    sender: "user_2",
    content: "Welcome to the AI Content Generator project! Ready to revolutionize content creation?",
    timestamp: "2024-01-14T10:00:00Z",
  },
  {
    id: 5,
    projectId: 2,
    sender: "user_4",
    content: "I've been working on some ML models that could be perfect for this.",
    timestamp: "2024-01-14T10:30:00Z",
  },
]

export const mockMarketData = [
  { date: "2024-01-01", price: 0.08, volume: 1200 },
  { date: "2024-01-02", price: 0.085, volume: 1350 },
  { date: "2024-01-03", price: 0.09, volume: 1100 },
  { date: "2024-01-04", price: 0.095, volume: 1450 },
  { date: "2024-01-05", price: 0.092, volume: 1300 },
  { date: "2024-01-06", price: 0.098, volume: 1600 },
  { date: "2024-01-07", price: 0.105, volume: 1800 },
  { date: "2024-01-08", price: 0.102, volume: 1550 },
  { date: "2024-01-09", price: 0.108, volume: 1750 },
  { date: "2024-01-10", price: 0.11, volume: 1900 },
]

export function getUserProjects(userId: string): Project[] {
  return mockProjects.filter((project) => project.owner === userId || project.team.includes(userId))
}

export function getUserApplications(userId: string): Application[] {
  return mockProjects.flatMap((project) => project.applications.filter((app) => app.applicant === userId))
}

export function getUserShareholdings(userId: string): Array<{ project: Project; shares: number }> {
  return mockProjects
    .filter((project) => project.isTokenized)
    .map((project) => {
      const shareholding = project.shareBalances.find(([id]) => id === userId)
      return shareholding ? { project, shares: shareholding[1] } : null
    })
    .filter(Boolean) as Array<{ project: Project; shares: number }>
}

export function getProjectChatMessages(projectId: number): ChatMessage[] {
  return mockChatMessages.filter((message) => message.projectId === projectId)
}

export function getProjectReviews(projectId: number): Review[] {
  return mockProjects.flatMap((project) => project.reviews.filter((review) => review.projectId === projectId))
}
