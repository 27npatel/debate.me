"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Globe,
  Users,
  MessageSquare,
  Clock,
  Calendar,
  Tag,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface DebateUser {
  _id: string;
  name: string;
  username: string;
  preferredLanguage: string;
  avatar?: string;
}

interface Debate {
  _id: string;
  title: string;
  description: string;
  status: string;
  startTime?: string;
  host: DebateUser;
  languages: string[];
  topics: string[];
  participants: DebateUser[];
  capacity: number;
}

// Debate card component
function DebateCard({ debate }: { debate: Debate }) {
  const isLive = debate.status === 'active';
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge 
            variant="secondary" 
            className={isLive ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}
          >
            {isLive ? 'Live' : 'Scheduled'}
          </Badge>
          <div className="flex items-center text-xs text-muted-foreground">
            {isLive ? (
              <>
                <Users className="mr-1 h-3 w-3" />
                {debate.participants.length}/{debate.capacity}
              </>
            ) : (
              <>
                <Calendar className="mr-1 h-3 w-3" />
                {debate.startTime}
              </>
            )}
          </div>
        </div>
        <CardTitle className="line-clamp-1 text-lg">{debate.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {debate.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-1">
            <Globe className="mt-0.5 h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">{debate.languages.join(", ")}</span>
          </div>
          {!isLive && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{debate.participants.length} registered</span>
            </div>
          )}
          <div className="flex flex-wrap gap-1">
            {debate.topics.map(topic => (
              <Badge key={`${debate._id}-${topic}`} variant="outline" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button asChild className="w-full" size="sm" variant={isLive ? "default" : "outline"}>
          <Link href={`/dashboard/debates/${debate._id}`}>
            {isLive ? (
              <>Join Now <ArrowUpRight className="ml-1 h-3 w-3" /></>
            ) : (
              'Register'
            )}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

// Mock user data
const mockUser = {
  _id: "1",
  username: "johndoe",
  name: "John Doe",
  email: "john@example.com",
  preferredLanguage: "en",
  bio: "Debate enthusiast",
  location: "New York",
  avatar: "",
  interests: ["Technology", "Politics"],
  socialLinks: {},
  rating: 4.5,
  debateStats: { won: 10, lost: 2, drawn: 3 },
  createdAt: "2024-01-01T00:00:00.000Z",
  lastActive: "2024-03-20T12:00:00.000Z"
};

// Mock debate data
const debates = [
  {
    id: "1",
    title: "Climate Change Solutions",
    description: "Discussing practical approaches to combat climate change effects globally",
    participants: 6,
    languages: ["English", "Spanish", "Chinese"],
    topics: ["Environment", "Science", "Politics"],
    status: "active",
    startTime: "Live now",
    capacity: 12,
  },
  {
    id: "2",
    title: "Global Education Inequality",
    description: "Examining disparities in educational access across different regions",
    participants: 4,
    languages: ["English", "French", "Arabic"],
    topics: ["Education", "Society", "Economics"],
    status: "scheduled",
    startTime: "Tomorrow, 2:00 PM",
    capacity: 10,
  },
  {
    id: "3",
    title: "Future of Remote Work",
    description: "Discussing how remote work is shaping employment across cultures",
    participants: 8,
    languages: ["English", "German", "Japanese"],
    topics: ["Technology", "Business", "Future"],
    status: "active",
    startTime: "Live now",
    capacity: 15,
  },
  {
    id: "4",
    title: "Cultural Exchange in Arts",
    description: "Exploring how different cultural perspectives influence artistic expression",
    participants: 3,
    languages: ["English", "Italian", "Korean"],
    topics: ["Arts", "Culture", "History"],
    status: "scheduled",
    startTime: "May 21, 4:00 PM",
    capacity: 8,
  },
  {
    id: "5",
    title: "Digital Privacy in Modern Society",
    description: "Discussing the balance between technological advancement and privacy concerns",
    participants: 7,
    languages: ["English", "Russian", "Portuguese"],
    topics: ["Technology", "Ethics", "Law"],
    status: "active",
    startTime: "Live now",
    capacity: 12,
  },
  {
    id: "6",
    title: "Sustainable Food Systems",
    description: "Exploring innovative approaches to food production and distribution",
    participants: 5,
    languages: ["English", "Hindi", "Spanish"],
    topics: ["Environment", "Health", "Science"],
    status: "scheduled",
    startTime: "May 22, 1:00 PM",
    capacity: 10,
  },
];

// Popular topics for filtering
const popularTopics = [
  "Technology",
  "Environment",
  "Culture",
  "Politics",
  "Education",
  "Health",
  "Business",
  "Science",
  "Arts",
  "Society",
];

// Languages for filtering
const languages = [
  "English",
  "Spanish",
  "French",
  "Chinese",
  "Arabic",
  "Russian",
  "Portuguese",
  "German",
  "Japanese",
  "Hindi",
];

export default function DiscoverPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [participantRange, setParticipantRange] = useState([0, 15]);
  const [debates, setDebates] = useState<Debate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDebates = async () => {
      setLoading(true);
      try {
        const res = await api.getDebates() as { debates: Debate[] };
        setDebates(res.debates || []);
      } catch (err) {
        const error = err as Error;
        setError(error.message || "Failed to load debates");
      } finally {
        setLoading(false);
      }
    };
    fetchDebates();
  }, []);

  // Filter debates based on search, topics, languages, and status
  const filterDebates = (status: string) => {
    return debates
      .filter((debate) => debate.status === status)
      .filter((debate) => {
        if (!searchQuery) return true;
        return (
          debate.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (debate.description && debate.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (debate.topics && debate.topics.some((topic: string) => topic.toLowerCase().includes(searchQuery.toLowerCase())))
        );
      })
      .filter((debate) => {
        if (selectedTopics.length === 0) return true;
        return debate.topics && debate.topics.some((topic: string) => selectedTopics.includes(topic));
      })
      .filter((debate) => {
        if (selectedLanguages.length === 0) return true;
        return debate.languages && debate.languages.some((lang: string) => selectedLanguages.includes(lang));
      })
      .filter((debate) => {
        return debate.participants && debate.participants.length >= participantRange[0] && debate.participants.length <= participantRange[1];
      });
  };

  const handleTopicToggle = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleLanguageToggle = (language: string) => {
    if (selectedLanguages.includes(language)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== language));
    } else {
      setSelectedLanguages([...selectedLanguages, language]);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedTopics([]);
    setSelectedLanguages([]);
    setParticipantRange([0, 15]);
  };

  return (
    <DashboardLayout user={user || mockUser}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discover Debates</h1>
          <p className="text-muted-foreground">
            Find and join conversations on topics that interest you
          </p>
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: "280px 1fr" }}>
          {/* Filters sidebar */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Refine your search</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filter by Topics */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {popularTopics.map(topic => (
                    <Badge
                      key={topic}
                      variant={selectedTopics.includes(topic) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleTopicToggle(topic)}
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Filter by Languages */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {languages.map(language => (
                    <Badge
                      key={language}
                      variant={selectedLanguages.includes(language) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleLanguageToggle(language)}
                    >
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Filter by Participants */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Participants</h3>
                <div className="space-y-1">
                  <Slider
                    value={participantRange}
                    min={0}
                    max={15}
                    step={1}
                    onValueChange={setParticipantRange}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{participantRange[0]} - {participantRange[1]}</span>
                  </div>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>

          {/* Main content */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search debates by title, description, or topic"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Link href={`/dashboard/debates/create`}>
                <Button>
                  Create New Debate
                </Button>
              </Link>
            </div>

            <Tabs defaultValue="active">
              <TabsList>
                <TabsTrigger value="active">Live Debates</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled Debates</TabsTrigger>
              </TabsList>
              <TabsContent value="active" className="space-y-4 pt-4">
                {filterDebates("active").length > 0 ? (
                  filterDebates("active").map(debate => (
                    <DebateCard key={debate._id} debate={debate} />
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <h3 className="text-lg font-medium">No active debates found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters or create your own debate!
                    </p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="scheduled" className="space-y-4 pt-4">
                {filterDebates("scheduled").length > 0 ? (
                  filterDebates("scheduled").map(debate => (
                    <DebateCard key={debate._id} debate={debate} />
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <h3 className="text-lg font-medium">No scheduled debates found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters or check back later!
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
