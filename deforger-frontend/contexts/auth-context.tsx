"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { FloatingAIButton } from "@/components/floating-ai-button";
import { AICopilotSidebar } from "@/components/ai-copilot-sidebar";
import { ProjectsPage } from "@/components/projects-page";
import { ProjectDetailPage } from "@/components/project-detail-page";
import { DashboardPage } from "@/components/dashboard-page";
import { UserProfilePage } from "@/components/user-profile-page";
import { CreateProjectPage } from "@/components/create-project-page";
import { MyProjectsPage } from "@/components/my-projects-page";
import { PortfolioPage } from "@/components/portfolio-page";
import { AuthModal } from "@/components/auth-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { mockProjects } from "@/lib/mock-data";
import { UserProfile } from "@/lib/types";
import { backendActor } from "@/utils/service/actor-locator";

type AuthContextType = {
  user: UserProfile | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (data: {
    username: string;
    password: string;
    name: string;
    role: string;
    skills: string[];
    portfolioUrl: string;
  }) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

type View =
  | "landing"
  | "projects"
  | "project-detail"
  | "dashboard"
  | "profile"
  | "create-project"
  | "my-projects"
  | "portfolio"
  | "auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
          const profile = await backendActor.getUserProfile(storedUserId);
          if (profile.length > 0) {
            setUser(profile[0]);
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const result = await backendActor.login(username, password);
      if (result.length > 0) {
        const { userId, token } = result[0];
        const profile = await backendActor.getUserProfile(userId);
        if (profile.length > 0) {
          setUser(profile[0]);
          localStorage.setItem("userId", userId);
          localStorage.setItem("sessionToken", token);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (data: {
    username: string;
    password: string;
    name: string;
    role: string;
    skills: string[];
    portfolioUrl: string;
  }) => {
    try {
      const success = await backendActor.register(
        data.username,
        data.password,
        data.name,
        data.role,
        data.skills,
        data.portfolioUrl
      );

      if (success) {
        const result = await backendActor.login(data.username, data.password);

        if (result.length > 0) {
          const { userId, token } = result[0];
          const profile = await backendActor.getUserProfile(userId);

          if (profile.length > 0) {
            setUser(profile[0]);
            localStorage.setItem("userId", userId);
            localStorage.setItem("sessionToken", token);
            return true;
          }
        }
      }

      console.error("Registration flow failed at some point.");
      return false;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("userId");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function HomePageContent() {
  const { user, logout } = useAuth();
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>("landing");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [projects, setProjects] = useState(mockProjects);

  const handleViewProject = (projectId: number) => {
    setSelectedProjectId(projectId);
    setCurrentView("project-detail");
  };

  const handleBackToProjects = () => {
    setCurrentView("projects");
    setSelectedProjectId(null);
  };

  const handleNavigation = (view: string, data?: any) => {
    if (view === "auth") {
      setIsAuthModalOpen(true);
      return;
    }

    if (view === "project-detail" && data?.projectId) {
      setSelectedProjectId(data.projectId);
    }
    setCurrentView(view as View);
    if (view !== "project-detail") {
      setSelectedProjectId(null);
    }
  };

  const handleSignOut = () => {
    logout();
    setCurrentView("landing");
  };

  const handleCreateProject = (newProject: any) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "projects":
        return <ProjectsPage onViewProject={handleViewProject} />;
      case "project-detail":
        return selectedProjectId ? (
          <ProjectDetailPage
            projectId={selectedProjectId}
            onBack={handleBackToProjects}
          />
        ) : null;
      case "dashboard":
        return (
          <DashboardPage
            onViewProject={handleViewProject}
            onViewProfile={() => setCurrentView("profile")}
          />
        );
      case "profile":
        return <UserProfilePage onBack={() => setCurrentView("dashboard")} />;
      case "create-project":
        return (
          <CreateProjectPage
            onBack={() => setCurrentView("projects")}
            onCreateProject={handleCreateProject}
          />
        );
      case "my-projects":
        return user ? (
          <MyProjectsPage userId={user.id} onNavigate={handleNavigation} />
        ) : null;
      case "portfolio":
        return user ? (
          <PortfolioPage userId={user.id} onNavigate={handleNavigation} />
        ) : null;
      default:
        return (
          <>
            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20 text-center">
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="gradient-text">Autonomous Talent.</span>
                <br />
                <span className="gradient-text">Decentralized Teams.</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                AI-powered platform where intelligent agents match the perfect
                talent with groundbreaking projects. Build the future, together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="gradient-primary text-white text-lg px-8 py-4 hover:opacity-90 cursor-pointer transition-opacity"
                  onClick={() => setCurrentView("projects")}
                >
                  Explore Projects
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4 border-accent/30 text-accent hover:bg-accent/10 hover:text-accent cursor-pointer bg-transparent"
                  onClick={() => setIsCopilotOpen(true)}
                >
                  <svg
                    className="w-5 h-5 mr-2"
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
                  Ask AIForge
                </Button>
              </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-4 py-20">
              <h2 className="text-3xl font-bold text-center mb-12 gradient-text">
                The Future of Work is Here
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="glass hover:glass-strong transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                    <CardTitle>AI Matching</CardTitle>
                    <CardDescription>
                      Advanced algorithms analyze skills, experience, and
                      project requirements to create perfect matches.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="glass hover:glass-strong transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                    <CardTitle>Project Tokenization</CardTitle>
                    <CardDescription>
                      Transform projects into tradeable assets, enabling new
                      forms of collaboration and investment.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="glass hover:glass-strong transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <CardTitle>Decentralized Teams</CardTitle>
                    <CardDescription>
                      Build global teams without borders. Collaborate seamlessly
                      across time zones and cultures.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isAuthenticated={!!user}
        currentPage={currentView}
        user={user}
        onNavigate={handleNavigation}
        onSignOut={handleSignOut}
      />

      <FloatingAIButton
        isOpen={isCopilotOpen}
        onClick={() => setIsCopilotOpen(!isCopilotOpen)}
      />

      <AICopilotSidebar
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onNavigate={handleNavigation}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <main className="pt-16">{renderCurrentView()}</main>
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <HomePageContent />
    </AuthProvider>
  );
}
