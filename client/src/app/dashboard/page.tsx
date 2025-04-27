"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Users,
  Globe,
  ChevronRight,
  Flag,
  BarChart,
  TrendingUp,
  Clock,
  Calendar,
  Search,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Debate {
  _id: string;
  title: string;
  description: string;
  status: string;
  startTime?: string;
  endTime?: string;
  host: {
    _id: string;
    name: string;
    avatar?: string;
  };
  participants: {
    user: {
      _id: string;
      name: string;
      avatar?: string;
    };
    joinedAt: string;
    leftAt?: string;
    isActive: boolean;
  }[];
  languages: string[];
  topics: string[];
  capacity: number;
}

interface Connection {
  debateId: string;
  title: string;
  status: string;
  host: {
    _id: string;
    name: string;
    avatar?: string;
  };
  participants: {
    user: {
      _id: string;
      name: string;
      avatar?: string;
    };
    joinedAt: string;
    leftAt?: string;
    isActive: boolean;
  }[];
  lastMessage?: {
    text: string;
    timestamp: string;
    user: {
      _id: string;
      name: string;
      avatar?: string;
    };
  };
  joinedAt: string;
}

// Mock data for features not yet implemented
const mockData = {
  totalDebates: 12,
  wordsTranslated: 3240,
  connections: 18,
  recentDebates: [
    {
      id: "1",
      title: "Climate Change Solutions",
      participants: 6,
      languages: ["English", "Spanish", "Chinese"],
      active: true,
      lastActive: "Just now",
    },
    {
      id: "2",
      title: "Global Economic Equality",
      participants: 8,
      languages: ["English", "French", "Portuguese", "Arabic"],
      active: false,
      lastActive: "2 hours ago",
    },
    {
      id: "3",
      title: "Cultural Exchange in Modern Society",
      participants: 4,
      languages: ["English", "Japanese", "Korean"],
      active: false,
      lastActive: "Yesterday",
    },
  ],
  upcomingDebates: [
    {
      id: "4",
      title: "Sustainable Urban Development",
      date: "Tomorrow, 3:00 PM",
      participants: 12,
      host: "Emma Wilson",
    },
    {
      id: "5",
      title: "Digital Privacy in the 21st Century",
      date: "May 20, 10:00 AM",
      participants: 15,
      host: "Alex Chen",
    },
  ],
  suggestedTopics: [
    "Renewable Energy Innovations",
    "Cross-Cultural Communication",
    "Global Education Systems",
    "Technology and Society",
    "International Relations"
  ],
  recentConnections: [
    {
      id: "1",
      name: "Elena Santos",
      language: "Spanish",
      image: "/avatars/elena.png",
      lastInteraction: "2 days ago"
    },
    {
      id: "2",
      name: "Wei Zhang",
      language: "Chinese",
      image: "/avatars/wei.png",
      lastInteraction: "1 week ago"
    },
    {
      id: "3",
      name: "Amara Okafor",
      language: "Yoruba",
      image: "/avatars/amara.png",
      lastInteraction: "2 weeks ago"
    },
  ]
};

function getTimeAgo(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [debates, setDebates] = useState<Debate[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [debatesResponse, connectionsResponse] = await Promise.all([
          api.getDebates(),
          api.getRecentConnections()
        ]);

        if (debatesResponse.success && debatesResponse.debates) {
          setDebates(debatesResponse.debates);
        } else {
          throw new Error('Failed to load debates');
        }

        if (connectionsResponse.success && connectionsResponse.connections) {
          // Map the connections to match the expected format
          const formattedConnections = connectionsResponse.connections
            .filter(conn => conn && conn._id && conn.name) // Filter out invalid connections
            .map(conn => ({
              debateId: `conn-${conn._id}`,
              title: '',
              status: 'active',
              host: {
                _id: conn._id,
                name: conn.name,
                avatar: conn.avatar || '',
                username: conn.username || ''
              },
              participants: [{ 
                user: {
                  _id: conn._id,
                  name: conn.name,
                  avatar: conn.avatar || '',
                  username: conn.username || ''
                }, 
                joinedAt: conn.lastActive || new Date().toISOString(), 
                isActive: true 
              }],
              joinedAt: conn.lastActive || new Date().toISOString()
            }));

          setConnections(formattedConnections);
        } else {
          throw new Error('Failed to load connections');
        }
      } catch (err) {
        console.error('Error in fetchData:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!user) {
    return (
      <DashboardLayout user={user}>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Please log in</h1>
            <p className="text-muted-foreground">You need to be logged in to view this page.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Filter debates based on user's participation and status
  const userDebates = user ? debates.filter(debate => 
    debate.participants.some(p => p.user && p.user._id === user._id)
  ) : [];

  const activeDebates = userDebates.filter(debate => {
    // A debate is active only if:
    // 1. status is 'active' AND
    // 2. startTime is in the past AND
    // 3. endTime is not set or in the future
    const now = new Date();
    const startTime = debate.startTime ? new Date(debate.startTime) : null;
    const endTime = debate.endTime ? new Date(debate.endTime) : null;
    
    return debate.status === 'active' && 
           startTime && startTime <= now && 
           (!endTime || endTime > now);
  });

  const scheduledDebates = userDebates.filter(debate => {
    // A debate is scheduled only if:
    // 1. status is 'scheduled' OR
    // 2. status is 'active' but startTime is in the future
    const now = new Date();
    const startTime = debate.startTime ? new Date(debate.startTime) : null;
    
    return debate.status === 'scheduled' || 
           (debate.status === 'active' && startTime && startTime > now);
  });

  const pastDebates = userDebates.filter(debate => {
    // A debate is past only if:
    // 1. status is 'ended' OR
    // 2. endTime is in the past
    const now = new Date();
    const endTime = debate.endTime ? new Date(debate.endTime) : null;
    
    return debate.status === 'ended' || 
           (endTime && endTime <= now);
  });

  // Calculate total debates and connections
  const totalDebates = userDebates.length;
  const uniqueConnectionsCount = user ? new Set(
    userDebates.flatMap(debate => 
      debate.participants
        .filter(p => p.user && p.user._id !== user._id)
        .map(p => p.user._id)
    )
  ).size : 0;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}! Explore debates and connect with people around the world.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Debates</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDebates}</div>
              <p className="text-xs text-muted-foreground">+{activeDebates.length} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Words Translated</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connections</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueConnectionsCount}</div>
              <p className="text-xs text-muted-foreground">People you've debated with</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Language Fluency</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Intermediate</div>
              <p className="text-xs text-muted-foreground">Based on {user.preferredLanguage}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-7">
          <div className="md:col-span-4 space-y-4">
            <Tabs defaultValue="active">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Your Debates</h2>
                <TabsList>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                  <TabsTrigger value="past">Past</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="active" className="space-y-4">
                {activeDebates.map(debate => (
                  <Card key={debate._id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle>{debate.title}</CardTitle>
                        <Badge className="bg-green-500">Live</Badge>
                      </div>
                      <CardDescription>
                        {debate.participants.filter(p => p.isActive).length} participants • {debate.languages.join(", ")}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-2">
                      <Button asChild size="sm" className="w-full">
                        <Link href={`/dashboard/debates/${debate._id}`}>
                          Join Now
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}

                {activeDebates.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <MessageSquare className="h-10 w-10 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No active debates</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You don't have any active debates at the moment.
                    </p>
                    <Button asChild className="mt-4">
                      <Link href="/dashboard/discover">Find a Debate</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="scheduled" className="space-y-4">
                {scheduledDebates.map(debate => (
                  <Card key={debate._id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle>{debate.title}</CardTitle>
                        <span className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(debate.startTime!).toLocaleString()}
                        </span>
                      </div>
                      <CardDescription>
                        {debate.participants.length} participants • Hosted by {debate.host.name}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-2">
                      <Button asChild size="sm" variant="outline" className="w-full">
                        <Link href={`/dashboard/debates/${debate._id}`}>
                          View Details
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}

                {scheduledDebates.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <Calendar className="h-10 w-10 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No scheduled debates</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You don't have any upcoming scheduled debates.
                    </p>
                    <Button asChild className="mt-4">
                      <Link href="/dashboard/discover">Schedule a Debate</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                {pastDebates.map(debate => (
                  <Card key={debate._id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle>{debate.title}</CardTitle>
                        <span className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {new Date(debate.endTime!).toLocaleString()}
                        </span>
                      </div>
                      <CardDescription>
                        {debate.participants.length} participants • {debate.languages.join(", ")}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-2">
                      <Button asChild size="sm" variant="outline" className="w-full">
                        <Link href={`/dashboard/debates/${debate._id}`}>
                          View Transcript
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}

                {pastDebates.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <BarChart className="h-10 w-10 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No past debates</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You haven't participated in any debates yet.
                    </p>
                    <Button asChild className="mt-4">
                      <Link href="/dashboard/discover">Join Your First Debate</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Start a new conversation or join an existing one
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2 sm:grid-cols-2">
                <Button asChild variant="outline" className="justify-between">
                  <Link href="/dashboard/debates/create">
                    Create New Debate <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-between">
                  <Link href="/dashboard/discover">
                    Join Active Debate <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-between">
                  <Link href="/dashboard/connections">
                    Find Connections <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-between">
                  <Link href="/dashboard/profile">
                    Update Profile <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Topics</CardTitle>
                <CardDescription>
                  Topics you might be interested in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockData.suggestedTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-muted-foreground" />
                        <span>{topic}</span>
                      </div>
                      <Button size="sm" variant="ghost">Explore</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/dashboard/discover">
                    View More Topics
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Connections</CardTitle>
                <CardDescription>
                  Your most recently active friends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {connections.map((connection) => {
                    if (!connection?.host?.name) return null;
                    
                    const joinedDate = new Date(connection.joinedAt);
                    const timeAgo = getTimeAgo(joinedDate);

                    return (
                      <div key={connection.debateId} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 overflow-hidden">
                            {connection.host.avatar ? (
                              <img
                                src={connection.host.avatar}
                                alt={connection.host.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                                {connection.host.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{connection.host.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Last active {timeAgo}
                            </div>
                          </div>
                        </div>
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/dashboard/profile/${connection.host._id}`}>
                            View Profile
                          </Link>
                        </Button>
                      </div>
                    );
                  })}

                  {connections.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      No recent connections yet
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/dashboard/connections">
                    View All Connections
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
