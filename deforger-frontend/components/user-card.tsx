"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/lib/types"; // Make sure this type is correctly imported

interface UserCardProps {
  user: UserProfile;
  onViewProfile: (userId: string) => void;
}

export function UserCard({ user, onViewProfile }: UserCardProps) {
  return (
    <Card className="glass hover:glass-strong transition-all flex flex-col">
      <CardHeader className="text-center">
        <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-3">
          <span className="text-white text-xl font-bold">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </span>
        </div>
        <CardTitle className="text-xl">{user.name}</CardTitle>
        <p className="text-muted-foreground">{user.role}</p>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="mb-4">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Skills
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {user.skills.slice(0, 4).map((skill, index) => (
              <Badge key={index} variant="outline">
                {skill}
              </Badge>
            ))}
            {user.skills.length > 4 && (
              <Badge variant="secondary">+{user.skills.length - 4}</Badge>
            )}
          </div>
        </div>
        <Button
          onClick={() => onViewProfile(user.id)}
          className="w-full"
          variant="outline"
        >
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
}
