"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { UserCard } from "@/components/user-card";
import { backendActor } from "@/utils/service/actor-locator";
import { UserProfile } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DiscoverPeoplePageProps {
  onViewProfile: (userId: string) => void;
}

export function DiscoverPeoplePage({ onViewProfile }: DiscoverPeoplePageProps) {
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersResult = await backendActor.getAllUserProfiles();
        setAllUsers(usersResult as UserProfile[]);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    allUsers.forEach((user) => {
      user.skills.forEach((skill) => skills.add(skill));
    });
    return Array.from(skills).sort();
  }, [allUsers]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSkills =
        selectedSkills.length === 0 ||
        selectedSkills.every((skill) => user.skills.includes(skill));

      return matchesSearch && matchesSkills;
    });
  }, [searchQuery, selectedSkills, allUsers]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSkills([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-4">
          Discover People
        </h1>
        <p className="text-muted-foreground text-lg">
          Find talented professionals to build the future with
        </p>
      </div>

      <div className="glass p-6 rounded-lg mb-8 space-y-6">
        <Input
          placeholder="Search by name or username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Filter by Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {allSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant={
                    selectedSkills.includes(skill) ? "default" : "outline"
                  }
                  className={`cursor-pointer transition-all ${
                    selectedSkills.includes(skill)
                      ? "bg-accent text-accent-foreground border-accent"
                      : "hover:border-accent/50"
                  }`}
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-muted-foreground">
          Showing {filteredUsers.length} of {allUsers.length} users
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p>Loading users...</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onViewProfile={onViewProfile}
              />
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-foreground mb-2">
                No users found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search query or filters
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
