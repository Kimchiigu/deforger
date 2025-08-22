"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { AuthModal } from "@/components/auth-modal"

interface HeaderProps {
  currentView?: string
  onNavigate?: (view: string) => void
  isCopilotOpen?: boolean
  onToggleCopilot?: () => void
}

export function Header({ currentView, onNavigate, isCopilotOpen, onToggleCopilot }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { user, logout } = useAuth()

  const handleNavigation = (view: string) => {
    if (onNavigate) {
      onNavigate(view)
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleNavigation("landing")}>
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-xl font-bold gradient-text">DeForger</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNavigation("projects")}
              className={`transition-colors ${
                currentView === "projects" ? "text-accent" : "text-foreground hover:text-accent"
              }`}
            >
              Projects
            </button>
            {user && (
              <button
                onClick={() => handleNavigation("dashboard")}
                className={`transition-colors ${
                  currentView === "dashboard" ? "text-accent" : "text-foreground hover:text-accent"
                }`}
              >
                Dashboard
              </button>
            )}
            {user && (
              <button
                onClick={() => handleNavigation("profile")}
                className={`transition-colors ${
                  currentView === "profile" ? "text-accent" : "text-foreground hover:text-accent"
                }`}
              >
                My Profile
              </button>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCopilot}
              className={`hidden md:flex transition-all duration-200 ${
                isCopilotOpen
                  ? "text-accent bg-accent/10 border border-accent/30"
                  : "text-foreground hover:text-accent hover:bg-accent/5"
              }`}
            >
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${isCopilotOpen ? "scale-110" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {isCopilotOpen && <span className="ml-2 text-sm">Close AI</span>}
            </Button>

            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden md:flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <span className="text-sm text-foreground">{user.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                className="gradient-primary text-white hover:opacity-90 transition-opacity"
                onClick={() => setIsAuthModalOpen(true)}
              >
                Sign In
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden glass-strong border-t border-white/10">
            <nav className="container mx-auto px-4 py-4 space-y-4">
              <button
                onClick={() => handleNavigation("projects")}
                className="block w-full text-left text-foreground hover:text-accent transition-colors"
              >
                Projects
              </button>
              {user && (
                <button
                  onClick={() => handleNavigation("dashboard")}
                  className="block w-full text-left text-foreground hover:text-accent transition-colors"
                >
                  Dashboard
                </button>
              )}
              {user && (
                <button
                  onClick={() => handleNavigation("profile")}
                  className="block w-full text-left text-foreground hover:text-accent transition-colors"
                >
                  My Profile
                </button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCopilot}
                className={`w-full justify-start ${isCopilotOpen ? "text-accent" : "text-foreground"}`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                AI Copilot
              </Button>

              {user ? (
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <span className="text-sm text-foreground">{user.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full gradient-primary text-white hover:opacity-90 transition-opacity"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  Sign In
                </Button>
              )}
            </nav>
          </div>
        )}
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  )
}
