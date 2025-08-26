"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Search,
  Wallet,
  BadgeCent,
} from "lucide-react";

interface NavbarProps {
  isAuthenticated?: boolean;
  currentPage?: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onNavigate?: (page: string) => void;
  onSignOut?: () => void;
}

export function Navbar({
  isAuthenticated = false,
  currentPage = "",
  user,
  onNavigate,
  onSignOut,
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const publicNavigation = [
    { name: "Features", href: "/features" },
    { name: "How it Works", href: "/how-it-works" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const dashboardNavigation = [
    {
      name: "Dashboard",
      href: "dashboard",
      icon: LayoutDashboard,
      description: "Overview & Analytics",
    },
    {
      name: "Projects",
      href: "projects",
      icon: Search,
      description: "Browse & Create Projects",
      submenu: [
        { name: "Browse Projects", href: "projects" },
        { name: "Create Project", href: "create-project" },
        { name: "Search People", href: "discover-people" },
      ],
    },
    {
      name: "RWA Token Exchange",
      href: "rwa-exchange",
      icon: BadgeCent,
      description: "Exchange RWA Tokens",
    },
    {
      name: "Portfolio",
      href: "portfolio",
      icon: Wallet,
      description: "Token Holdings",
    },
  ];

  const getCurrentPageName = () => {
    const page = dashboardNavigation.find((nav) => nav.href === currentPage);
    return page ? page.name : "DeForger";
  };

  const handleNavigation = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
    setIsMenuOpen(false);
  };

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Main Header */}
      <header className="fixed top-4 left-1/2 z-50 w-full max-w-5xl -translate-x-1/2 px-4">
        <div className="flex items-center justify-between rounded-full border border-border/40 bg-background/95 px-6 py-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {/* Logo and Brand Name */}
          <button
            onClick={() =>
              handleNavigation(isAuthenticated ? "dashboard" : "landing")
            }
            className="flex items-center space-x-2 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              DeForger
            </span>
            {isAuthenticated && (
              <span className="hidden md:block text-sm text-muted-foreground ml-2">
                / {getCurrentPageName()}
              </span>
            )}
          </button>

          {/* Desktop Navigation */}
          {!isAuthenticated ? (
            <nav className="hidden gap-6 md:flex">
              {publicNavigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href.slice(1))}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  {item.name}
                </button>
              ))}
            </nav>
          ) : (
            <nav className="hidden gap-1 lg:flex">
              {dashboardNavigation.map((item) => {
                const isActive = currentPage === item.href;
                const buttonClasses = `flex items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`;

                return item.submenu ? (
                  <DropdownMenu key={item.name}>
                    <DropdownMenuTrigger asChild>
                      <button className={buttonClasses} title={item.name}>
                        <item.icon className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56 bg-background/95 backdrop-blur-xl border border-border/40"
                      align="center"
                    >
                      {item.submenu.map((subItem) => (
                        <DropdownMenuItem
                          key={subItem.name}
                          onClick={() => handleNavigation(subItem.href)}
                        >
                          {subItem.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={buttonClasses + " cursor-pointer"}
                    title={item.name}
                  >
                    <item.icon className="w-5 h-5" />
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Side Actions */}
          <div className="hidden items-center gap-3 md:flex">
            {!isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  className="rounded-full hover:text-gray-200 cursor-pointer"
                  onClick={() => handleNavigation("auth")}
                >
                  Sign In
                </Button>
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 font-semibold rounded-full cursor-pointer"
                  onClick={() => handleNavigation("auth")}
                >
                  Get Started
                </Button>
              </>
            ) : (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user?.avatar || ""}
                          alt={user?.name || ""}
                        />
                        <AvatarFallback>
                          {user?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 bg-background/95 backdrop-blur-xl border border-border/40"
                    align="end"
                    forceMount
                  >
                    <div className="flex flex-col space-y-1 p-2">
                      {user?.name && <p className="font-medium">{user.name}</p>}
                      {user?.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleNavigation("profile")}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-destructive"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed top-[80px] left-0 z-40 h-fit w-full animate-in fade-in-20 slide-in-from-top-5 md:hidden">
          <div className="mx-4 rounded-xl border bg-background/95 p-6 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {!isAuthenticated ? (
              <nav className="flex flex-col items-center gap-6">
                {publicNavigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href.slice(1))}
                    className="w-full rounded-md p-2 text-center text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                  >
                    {item.name}
                  </button>
                ))}
                <div className="mt-6 flex flex-col gap-3 w-full">
                  <Button
                    variant="ghost"
                    className="rounded-full"
                    onClick={() => handleNavigation("auth")}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 font-semibold rounded-full"
                    onClick={() => handleNavigation("auth")}
                  >
                    Get Started Free
                  </Button>
                </div>
              </nav>
            ) : (
              <nav className="flex flex-col gap-2">
                {dashboardNavigation.map((item) => {
                  const isActive = currentPage === item.href;
                  return (
                    <div key={item.name}>
                      <button
                        onClick={() => handleNavigation(item.href)}
                        className={`flex items-center space-x-3 rounded-md p-3 transition-all duration-200 w-full ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.description}
                          </div>
                        </div>
                      </button>
                      {item.submenu && (
                        <div className="ml-8 mt-2 space-y-1">
                          {item.submenu.map((subItem) => (
                            <button
                              key={subItem.name}
                              onClick={() => handleNavigation(subItem.href)}
                              className="block w-full text-left text-sm text-muted-foreground hover:text-primary p-2 rounded"
                            >
                              {subItem.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="mt-6 flex flex-col gap-3">
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="justify-start text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </nav>
            )}
          </div>
        </div>
      )}
    </>
  );
}
