"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { UserProfile } from "@/lib/types"

interface AuthContextType {
  user: UserProfile | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: Omit<UserProfile, "id"> & { email: string; password: string }) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem("deforger_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simple authentication check as specified
    if (email === "deforger@gmail.com" && password === "deforger") {
      const mockUser: UserProfile = {
        id: "user_1",
        username: "deforger_admin",
        name: "DeForger Admin",
        role: "Full Stack Developer",
        skills: ["React", "TypeScript", "Node.js", "Web3", "AI/ML"],
        portfolioUrl: "https://github.com/deforger",
      }

      setUser(mockUser)
      localStorage.setItem("deforger_user", JSON.stringify(mockUser))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const register = async (
    userData: Omit<UserProfile, "id"> & { email: string; password: string },
  ): Promise<boolean> => {
    setIsLoading(true)

    // Mock registration - in real app would call API
    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      username: userData.username,
      name: userData.name,
      role: userData.role,
      skills: userData.skills,
      portfolioUrl: userData.portfolioUrl,
    }

    setUser(newUser)
    localStorage.setItem("deforger_user", JSON.stringify(newUser))
    setIsLoading(false)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("deforger_user")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
