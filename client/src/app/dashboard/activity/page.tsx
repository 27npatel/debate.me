"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MessageSquare, UserPlus, Award, CheckCircle, ChevronRight, Globe, BarChart } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Mock user data
const user = {
  name: "John Doe",
  email: "john@example.com",
  language: "en",
  image: "",
};

// Mock activity data
const activities = [
  {
    id: "1",
    type: "debate_joined",
    title: "Climate Change Solutions",
    timestamp: "2 hours ago",
    description: "You joined a debate with 5 other participants",
    participants: ["Maria Garcia", "Wei Zhang", "David Kim"],
    languages: ["English", "Spanish", "Chinese"],
    icon: MessageSquare,
    iconColor: "text-blue-500",
    link: "/dashboard/debates/1",
  },
  {
    id: "2",
    type: "connection_accepted",
    title: "Connected with Carlos Mendez",
    timestamp: "Yesterday",
    description: "You accepted Carlos's connection request",
    icon: UserPlus,
    iconColor: "text-green-500",
    link: "/dashboard/connections",
  },
  {
    id: "3",
    type: "achievement_earned",
    title: "Achievement Unlocked: Global Communicator",
    timestamp: "2 days ago",
    description: "Participated in debates with people from 5+ countries",
    icon: Award,
    iconColor: "text-yellow-500",
    link: "/dashboard/profile?tab=achievements",
  },
  {
    id: "4",
    type: "debate_hosted",
    title: "Future of Remote Work",
    timestamp: "3 days ago",
    description: "You hosted a debate with 8 participants",
    participants: ["Elena Petrov", "Takashi Yamamoto", "Sophie Dubois"],
    languages: ["English", "Japanese", "French", "Russian"],
    icon: MessageSquare,
    iconColor: "text-purple-500",
    link: "/dashboard/debates/3",
  },
  {
    id: "5",
    type: "milestone_reached",
    title: "Milestone: 10 Debates Participated",
    timestamp: "1 week ago",
    description: "You've participated in 10 debates on Langlobe",
    icon: CheckCircle,
    iconColor: "text-green-500",
    link: "/dashboard/profile",
  },
  {
    id: "6",
    type: "achievement_earned",
    title: "Achievement Unlocked: Polyglot Novice",
    timestamp: "1 week ago",
    description: "Used 3 different languages in debates",
    icon: Globe,
    iconColor: "text-blue-500",
    link: "/dashboard/profile?tab=achievements",
  },
  {
    id: "7",
    type: "connection_made",
    title: "Connected with Wei Zhang",
    timestamp: "2 weeks ago",
    description: "You sent a connection request to Wei",
    icon: UserPlus,
    iconColor: "text-green-500",
    link: "/dashboard/connections",
  },
  {
    id: "8",
    type: "debate_joined",
    title: "Global Education Inequality",
    timestamp: "2 weeks ago",
    description: "You joined a debate with 4 other participants",
    participants: ["Fatima Ahmed", "Omar Hassan", "Priya Singh"],
    languages: ["English", "Arabic", "Hindi"],
    icon: MessageSquare,
    iconColor: "text-blue-500",
    link: "/dashboard/debates/2",
  },
];

// Weekly stats
const weeklyStats = {
  debatesParticipated: 3,
  debatesHosted: 1,
  newConnections: 2,
  wordsTranslated: 843,
  minutesSpent: 145,
  previousWeek: {
    debatesParticipated: 2,
    debatesHosted: 0,
    newConnections: 1,
    wordsTranslated: 620,
    minutesSpent: 95,
  }
};

// Activity filter options
const filters = [
  { value: "all", label: "All Activity" },
  { value: "debates", label: "Debates" },
  { value: "connections", label: "Connections" },
  { value: "achievements", label: "Achievements" },
];

export default function ActivityPage() {
  const [filter, setFilter] = useState("all");

  // Filter activities based on selected filter
  const filteredActivities = activities.filter(activity => {
    if (filter === "all") return true;
    if (filter === "debates") return activity.type.includes("debate");
    if (filter === "connections") return activity.type.includes("connection");
    if (filter === "achievements") return activity.type.includes("achievement") || activity.type.includes("milestone");
    return true;
  });

  // Calculate percentage change for stats
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    const change = ((current - previous) / previous) * 100;
    return Math.round(change);
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity</h1>
          <p className="text-muted-foreground">
            Track your progress and activity on Langlobe
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_300px]">
          {/* Main activity timeline */}
          <div className="space-y-5">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Your Activity</CardTitle>
                  <div className="flex gap-1">
                    {filters.map((option) => (
                      <Button
                        key={option.value}
                        variant={filter === option.value ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setFilter(option.value)}
                        className="text-xs"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <CardDescription>
                  Your recent activity and achievements on Langlobe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredActivities.length > 0 ? (
                    filteredActivities.map((activity) => (
                      <div key={activity.id} className="relative pl-8">
                        <div className={`absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full ${activity.iconColor} bg-opacity-10`}>
                          <activity.icon className={`h-3.5 w-3.5 ${activity.iconColor}`} />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium leading-none">{activity.title}</h3>
                            <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>

                          {/* Render additional details for debates */}
                          {(activity.type === "debate_joined" || activity.type === "debate_hosted") && (
                            <div className="mt-2 rounded-md bg-muted/50 p-2">
                              {activity.participants && (
                                <div className="flex flex-wrap items-center gap-1 text-xs">
                                  <span className="text-muted-foreground">With:</span>
                                  {activity.participants.map((participant, index) => (
                                    <span key={participant}>
                                      {participant}
                                      {index < activity.participants.length - 1 ? ", " : ""}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {activity.languages && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {activity.languages.map((language) => (
                                    <Badge key={language} variant="outline" className="text-xs">
                                      {language}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs text-primary"
                            asChild
                          >
                            <a href={activity.link}>View Details</a>
                          </Button>
                        </div>
                        {activity.id !== filteredActivities[filteredActivities.length - 1].id && (
                          <Separator className="my-4" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Clock className="h-10 w-10 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">No activities found</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Try selecting a different filter or come back later
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View More Activity
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>This Week</CardTitle>
                <CardDescription>
                  Your activity from the past 7 days
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/10">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Debates Participated</div>
                        <div className="text-2xl font-bold">{weeklyStats.debatesParticipated}</div>
                      </div>
                    </div>
                    <Badge variant={calculateChange(weeklyStats.debatesParticipated, weeklyStats.previousWeek.debatesParticipated) >= 0 ? "success" : "destructive"} className="text-xs">
                      {calculateChange(weeklyStats.debatesParticipated, weeklyStats.previousWeek.debatesParticipated) >= 0 ? "+" : ""}
                      {calculateChange(weeklyStats.debatesParticipated, weeklyStats.previousWeek.debatesParticipated)}%
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-500/10">
                        <MessageSquare className="h-4 w-4 text-purple-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Debates Hosted</div>
                        <div className="text-2xl font-bold">{weeklyStats.debatesHosted}</div>
                      </div>
                    </div>
                    <Badge variant={calculateChange(weeklyStats.debatesHosted, weeklyStats.previousWeek.debatesHosted) >= 0 ? "success" : "destructive"} className="text-xs">
                      {calculateChange(weeklyStats.debatesHosted, weeklyStats.previousWeek.debatesHosted) >= 0 ? "+" : ""}
                      {calculateChange(weeklyStats.debatesHosted, weeklyStats.previousWeek.debatesHosted)}%
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500/10">
                        <UserPlus className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">New Connections</div>
                        <div className="text-2xl font-bold">{weeklyStats.newConnections}</div>
                      </div>
                    </div>
                    <Badge variant={calculateChange(weeklyStats.newConnections, weeklyStats.previousWeek.newConnections) >= 0 ? "success" : "destructive"} className="text-xs">
                      {calculateChange(weeklyStats.newConnections, weeklyStats.previousWeek.newConnections) >= 0 ? "+" : ""}
                      {calculateChange(weeklyStats.newConnections, weeklyStats.previousWeek.newConnections)}%
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/10">
                        <Globe className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Words Translated</div>
                        <div className="text-2xl font-bold">{weeklyStats.wordsTranslated}</div>
                      </div>
                    </div>
                    <Badge variant={calculateChange(weeklyStats.wordsTranslated, weeklyStats.previousWeek.wordsTranslated) >= 0 ? "success" : "destructive"} className="text-xs">
                      {calculateChange(weeklyStats.wordsTranslated, weeklyStats.previousWeek.wordsTranslated) >= 0 ? "+" : ""}
                      {calculateChange(weeklyStats.wordsTranslated, weeklyStats.previousWeek.wordsTranslated)}%
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500/10">
                        <Clock className="h-4 w-4 text-orange-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Minutes Spent</div>
                        <div className="text-2xl font-bold">{weeklyStats.minutesSpent}</div>
                      </div>
                    </div>
                    <Badge variant={calculateChange(weeklyStats.minutesSpent, weeklyStats.previousWeek.minutesSpent) >= 0 ? "success" : "destructive"} className="text-xs">
                      {calculateChange(weeklyStats.minutesSpent, weeklyStats.previousWeek.minutesSpent) >= 0 ? "+" : ""}
                      {calculateChange(weeklyStats.minutesSpent, weeklyStats.previousWeek.minutesSpent)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/dashboard/analytics">
                    View Detailed Analytics
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Latest Achievements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activities
                  .filter(activity => activity.type === "achievement_earned" || activity.type === "milestone_reached")
                  .slice(0, 3)
                  .map((achievement) => (
                    <div key={achievement.id} className="flex items-start gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${achievement.iconColor} bg-opacity-10`}>
                        <achievement.icon className={`h-5 w-5 ${achievement.iconColor}`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{achievement.title}</h4>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{achievement.timestamp}</p>
                      </div>
                    </div>
                  ))}
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" asChild>
                  <a href="/dashboard/profile?tab=achievements">View All Achievements</a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
