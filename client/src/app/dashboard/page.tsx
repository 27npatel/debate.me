"use client";

import React, { useState } from "react";
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

// Mock user data - in a real app, this would come from your authentication system
const user = {
  name: "John Doe",
  email: "john@example.com",
  language: "en",
  languageName: "English",
  joinDate: "March 2024",
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

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");

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
              <div className="text-2xl font-bold">{user.totalDebates}</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Words Translated</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.wordsTranslated}</div>
              <p className="text-xs text-muted-foreground">+520 from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connections</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.connections}</div>
              <p className="text-xs text-muted-foreground">+4 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Language Fluency</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Intermediate</div>
              <p className="text-xs text-muted-foreground">Based on {user.languageName}</p>
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
                {user.recentDebates.filter(debate => debate.active).map(debate => (
                  <Card key={debate.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle>{debate.title}</CardTitle>
                        <Badge className="bg-green-500">Live</Badge>
                      </div>
                      <CardDescription>
                        {debate.participants} participants • {debate.languages.join(", ")}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-2">
                      <Button asChild size="sm" className="w-full">
                        <Link href={`/dashboard/debates/${debate.id}`}>
                          Join Now
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}

                {user.recentDebates.filter(debate => debate.active).length === 0 && (
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
                {user.upcomingDebates.map(debate => (
                  <Card key={debate.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle>{debate.title}</CardTitle>
                        <span className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          {debate.date}
                        </span>
                      </div>
                      <CardDescription>
                        {debate.participants} participants • Hosted by {debate.host}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-2">
                      <Button asChild size="sm" variant="outline" className="w-full">
                        <Link href={`/dashboard/debates/${debate.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}

                {user.upcomingDebates.length === 0 && (
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
                {user.recentDebates.filter(debate => !debate.active).map(debate => (
                  <Card key={debate.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle>{debate.title}</CardTitle>
                        <span className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {debate.lastActive}
                        </span>
                      </div>
                      <CardDescription>
                        {debate.participants} participants • {debate.languages.join(", ")}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-2">
                      <Button asChild size="sm" variant="outline" className="w-full">
                        <Link href={`/dashboard/debates/${debate.id}`}>
                          View Transcript
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}

                {user.recentDebates.filter(debate => !debate.active).length === 0 && (
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
                  {user.suggestedTopics.map((topic, index) => (
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
                  People you've debated with recently
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.recentConnections.map((connection) => (
                    <div key={connection.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 overflow-hidden">
                          {connection.image ? (
                            <img
                              src={connection.image}
                              alt={connection.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                              {connection.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{connection.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {connection.language} • {connection.lastInteraction}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        Message
                      </Button>
                    </div>
                  ))}
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
