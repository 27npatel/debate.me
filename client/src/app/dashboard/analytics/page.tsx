"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, PieChart, Clock, Globe, Users, MessageSquare, Languages, TrendingUp, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";

// Mock analytics data
const analyticsData = {
  debates: {
    total: 24,
    hosted: 5,
    joined: 19,
    byMonth: [
      { month: "Jan", count: 2 },
      { month: "Feb", count: 3 },
      { month: "Mar", count: 5 },
      { month: "Apr", count: 6 },
      { month: "May", count: 8 },
    ],
    byLanguage: [
      { language: "English", count: 24 },
      { language: "Spanish", count: 18 },
      { language: "French", count: 10 },
      { language: "Chinese", count: 8 },
      { language: "Arabic", count: 5 },
    ],
    byTopic: [
      { topic: "Environment", count: 7 },
      { topic: "Technology", count: 5 },
      { topic: "Politics", count: 4 },
      { topic: "Education", count: 4 },
      { topic: "Culture", count: 3 },
      { topic: "Other", count: 1 },
    ],
  },
  connections: {
    total: 18,
    byLanguage: [
      { language: "Spanish", count: 6 },
      { language: "Chinese", count: 4 },
      { language: "English", count: 3 },
      { language: "Arabic", count: 2 },
      { language: "French", count: 2 },
      { language: "Other", count: 1 },
    ],
    growth: [
      { month: "Jan", count: 2 },
      { month: "Feb", count: 5 },
      { month: "Mar", count: 9 },
      { month: "Apr", count: 14 },
      { month: "May", count: 18 },
    ],
  },
  translations: {
    total: 12500,
    fromLanguage: [
      { language: "Spanish", count: 4800 },
      { language: "Chinese", count: 3200 },
      { language: "French", count: 2100 },
      { language: "Arabic", count: 1500 },
      { language: "Other", count: 900 },
    ],
    toLanguage: [
      { language: "English", count: 8500 },
      { language: "Spanish", count: 2000 },
      { language: "French", count: 1000 },
      { language: "Chinese", count: 600 },
      { language: "Other", count: 400 },
    ],
    byMonth: [
      { month: "Jan", count: 1200 },
      { month: "Feb", count: 2100 },
      { month: "Mar", count: 2800 },
      { month: "Apr", count: 3100 },
      { month: "May", count: 3300 },
    ],
  },
  timeSpent: {
    total: 36, // hours
    byActivity: [
      { activity: "Debates", hours: 28 },
      { activity: "Messaging", hours: 5 },
      { activity: "Profile Setup", hours: 3 },
    ],
    byMonth: [
      { month: "Jan", hours: 4 },
      { month: "Feb", hours: 6 },
      { month: "Mar", hours: 8 },
      { month: "Apr", hours: 9 },
      { month: "May", hours: 9 },
    ],
  },
};

// Time period options
const timePeriods = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
  { value: "all", label: "All Time" },
];

interface ChartData {
  month: string;
  count?: number;
  hours?: number;
}

interface DistributionData {
  [key: string]: string | number;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [timePeriod, setTimePeriod] = useState("all");

  // Function to create bar chart
  const renderBarChart = (data: ChartData[], title: string, subtitle: string, color: string) => {
    const maxValue = Math.max(...data.map(item => item.count || item.hours || 0));

    return (
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="space-y-2">
          {data.map((item) => {
            const value = item.count || item.hours || 0;
            const percentage = (value / maxValue) * 100;

            return (
              <div key={item.month} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>{item.month}</span>
                  <span className="font-medium">{value}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className={`h-2 rounded-full ${color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Function to create pie chart (simplified visual representation)
  const renderDistributionChart = (data: DistributionData[], labelKey: string, valueKey: string, title: string, maxItems = 5) => {
    const total = data.reduce((sum, item) => sum + (item[valueKey] as number), 0);
    const sortedData = [...data].sort((a, b) => (b[valueKey] as number) - (a[valueKey] as number)).slice(0, maxItems);

    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="space-y-2">
          {sortedData.map((item) => {
            const percentage = Math.round(((item[valueKey] as number) / total) * 100);

            return (
              <div key={item[labelKey] as string} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    {item[labelKey] as string}
                  </span>
                  <span>{percentage}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <DashboardLayout user={{
        _id: "",
        username: "",
        name: "",
        email: "",
        preferredLanguage: "en",
        bio: "",
        location: "",
        avatar: "",
        interests: [],
        socialLinks: {},
        rating: 0,
        debateStats: { won: 0, lost: 0, drawn: 0 },
        createdAt: "",
        lastActive: ""
      }}>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Please log in</h1>
            <p className="text-muted-foreground">You need to be logged in to view analytics.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              View your detailed stats and progress on Langlobe
            </p>
          </div>
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              {timePeriods.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Debates</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.debates.total}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span className="font-medium text-primary">{analyticsData.debates.hosted}</span>
                <span className="mx-1">hosted</span>•
                <span className="mx-1 font-medium text-primary">{analyticsData.debates.joined}</span>
                <span>joined</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connections</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.connections.total}</div>
              <p className="text-xs text-muted-foreground">
                From {analyticsData.connections.byLanguage.length} different languages
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Words Translated</CardTitle>
              <Languages className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.translations.total.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                Across {analyticsData.translations.fromLanguage.length} languages
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.timeSpent.total} hrs</div>
              <p className="text-xs text-muted-foreground">
                Since joining in {new Date(user.createdAt).toLocaleDateString('default', { month: 'long', year: 'numeric' })}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="debates" className="space-y-4">
          <TabsList>
            <TabsTrigger value="debates">Debates</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
            <TabsTrigger value="time">Time & Usage</TabsTrigger>
          </TabsList>

          <TabsContent value="debates" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Debate Activity</CardTitle>
                  <CardDescription>Number of debates over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderBarChart(
                    analyticsData.debates.byMonth,
                    "Monthly Debate Participation",
                    "Number of debates you participated in each month",
                    "bg-blue-500"
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Topics Distribution</CardTitle>
                  <CardDescription>What you've been discussing</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderDistributionChart(
                    analyticsData.debates.byTopic,
                    "topic",
                    "count",
                    "Debates by Topic"
                  )}
                </CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Language Usage in Debates</CardTitle>
                  <CardDescription>Languages used in your debates</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderDistributionChart(
                    analyticsData.debates.byLanguage,
                    "language",
                    "count",
                    "Debate Language Distribution"
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="connections" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Connection Growth</CardTitle>
                  <CardDescription>How your network has grown over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderBarChart(
                    analyticsData.connections.growth,
                    "Connection Growth by Month",
                    "Total connections at the end of each month",
                    "bg-green-500"
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Languages of Connections</CardTitle>
                  <CardDescription>Native languages of your connections</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderDistributionChart(
                    analyticsData.connections.byLanguage,
                    "language",
                    "count",
                    "Connections by Language"
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="languages" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Translations From</CardTitle>
                  <CardDescription>Languages translated from</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderDistributionChart(
                    analyticsData.translations.fromLanguage,
                    "language",
                    "count",
                    "Words Translated From"
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Translations To</CardTitle>
                  <CardDescription>Languages translated to</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderDistributionChart(
                    analyticsData.translations.toLanguage,
                    "language",
                    "count",
                    "Words Translated To"
                  )}
                </CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Translation Volume</CardTitle>
                  <CardDescription>Words translated over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderBarChart(
                    analyticsData.translations.byMonth,
                    "Monthly Translation Volume",
                    "Number of words translated each month",
                    "bg-violet-500"
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="time" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Time Spent by Activity</CardTitle>
                  <CardDescription>How you spent your time on Langlobe</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderDistributionChart(
                    analyticsData.timeSpent.byActivity,
                    "activity",
                    "hours",
                    "Hours by Activity"
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Usage</CardTitle>
                  <CardDescription>Hours spent each month</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderBarChart(
                    analyticsData.timeSpent.byMonth,
                    "Monthly Usage",
                    "Hours spent on Langlobe each month",
                    "bg-orange-500"
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
