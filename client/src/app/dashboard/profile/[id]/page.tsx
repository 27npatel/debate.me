"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Mail, MapPin, Globe, Calendar, Award } from "lucide-react";

interface UserProfile {
  _id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  location: string;
  preferredLanguage: string;
  interests: string[];
  avatar: string;
  socialLinks: Record<string, string>;
  rating: number;
  debateStats: {
    won: number;
    lost: number;
    drawn: number;
  };
  createdAt: string;
  lastActive: string;
}

export default function UserProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch the user profile from your API
        // For now, we'll simulate a delay and return a mock profile
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data - replace with actual API call
        const mockProfile: UserProfile = {
          _id: id as string,
          name: "John Doe",
          username: "johndoe",
          email: "john@example.com",
          bio: "Debate enthusiast and public speaker",
          location: "New York, USA",
          preferredLanguage: "en",
          interests: ["Politics", "Technology", "Environment"],
          avatar: "",
          socialLinks: {},
          rating: 4.5,
          debateStats: {
            won: 12,
            lost: 3,
            drawn: 1
          },
          createdAt: "2023-01-15T00:00:00.000Z",
          lastActive: new Date().toISOString()
        };
        
        setProfile(mockProfile);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  if (!user) {
    return (
      <DashboardLayout user={user}>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Please log in</h1>
            <p className="text-muted-foreground">You need to be logged in to view profiles.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout user={user}>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Error</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
          <p className="text-muted-foreground">
            View user information and debate statistics
          </p>
        </div>

        {loading ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>
        ) : profile ? (
          <div className="grid gap-6 md:grid-cols-[280px_1fr]">
            {/* Profile Summary Card */}
            <Card className="h-fit">
              <CardHeader className="text-center">
                <Avatar className="mx-auto h-24 w-24">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback className="text-4xl">{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle>{profile.name}</CardTitle>
                <CardDescription>@{profile.username}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.location || "Location not set"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.preferredLanguage || "Not set"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Debate Statistics</h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <div className="font-medium">{profile.debateStats.won}</div>
                      <div className="text-xs text-muted-foreground">Won</div>
                    </div>
                    <div>
                      <div className="font-medium">{profile.debateStats.lost}</div>
                      <div className="text-xs text-muted-foreground">Lost</div>
                    </div>
                    <div>
                      <div className="font-medium">{profile.debateStats.drawn}</div>
                      <div className="text-xs text-muted-foreground">Drawn</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Content */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                  <CardDescription>User information and interests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Bio</h3>
                      <p>{profile.bio || "No bio provided"}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Interests</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profile.interests && profile.interests.length > 0 ? (
                          profile.interests.map((interest) => (
                            <Badge key={interest} variant="outline">
                              {interest}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No interests listed</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Rating</h3>
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-yellow-500" />
                        <span>{profile.rating.toFixed(1)} / 5.0</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex h-[50vh] items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Profile Not Found</h1>
              <p className="text-muted-foreground">The requested profile could not be found.</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 