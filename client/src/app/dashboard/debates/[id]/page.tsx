"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, MessageCircle, Mic, MicOff, Users, Volume2, Settings, Share } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface DebateUser {
  _id: string;
  name: string;
  username: string;
  preferredLanguage: string;
  avatar?: string;
}

interface Message {
  _id: string;
  user: DebateUser;
  text: string;
  translatedText?: string;
  timestamp: string;
  isTranslated?: boolean;
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
  messages: Message[];
}

const mockUser = {
  _id: "user1",
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

export default function DebatePage() {
  const params = useParams();
  const { user } = useAuth();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [debate, setDebate] = useState<Debate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(user?.preferredLanguage || "en");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDebate = async () => {
      setLoading(true);
      try {
        const res = await api.getDebateById(id as string) as { debate: Debate };
        setDebate(res.debate);
        setMessages(res.debate.messages || []);
      } catch (err) {
        const error = err as Error;
        setError(error.message || "Failed to load debate");
      } finally {
        setLoading(false);
      }
    };
    fetchDebate();
  }, [id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!user) {
    return (
      <DashboardLayout user={mockUser}>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Please log in</h1>
            <p className="text-muted-foreground">You need to be logged in to view debates.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Loading debate...</h1>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !debate) {
    return (
      <DashboardLayout user={user}>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Debate not found</h1>
            <p className="text-muted-foreground">{error || "The debate you're looking for doesn't exist or has ended."}</p>
            <Button className="mt-4" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Language display helper
  const getLanguageDisplay = (code: string) => {
    const languageMap: Record<string, string> = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      zh: "Chinese",
      ja: "Japanese",
      ko: "Korean",
      ar: "Arabic",
      hi: "Hindi",
      pt: "Portuguese",
      ru: "Russian"
    };
    return languageMap[code] || code;
  };

  // Function to handle sending a new message (local only for now)
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsg: Message = {
      _id: `msg${messages.length + 1}`,
      user: user,
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  // Calculate participant count
  const participantCount = debate ? 1 + (debate.participants?.length || 0) : 0;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{debate.title}</h1>
            <p className="text-muted-foreground">{debate.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-500/10 text-green-500">
              {debate.status === "active" ? "Live" : debate.status}
            </Badge>
            <span className="flex items-center text-sm text-muted-foreground">
              <Users className="mr-1 h-4 w-4" />
              {participantCount} participants
            </span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          {/* Main debate area */}
          <div className="flex h-[calc(100vh-250px)] flex-col overflow-hidden rounded-lg border bg-background">
            {/* Conversation area */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-4 p-4">
                  {messages.map((message) => (
                    <div key={message._id} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.user.avatar || ""} alt={message.user.name} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {message.user.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{message.user.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {getLanguageDisplay(message.user.preferredLanguage)}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(message.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-11 space-y-1">
                        <div className="rounded-lg bg-muted p-3 text-sm">
                          {message.text}
                        </div>
                        {message.isTranslated && message.translatedText && (
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              {message.translatedText}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Input area */}
            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                  <MessageCircle className="h-5 w-5" />
                  <span className="sr-only">Send message</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? (
                    <MicOff className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                  <span className="sr-only">
                    {isMuted ? "Unmute microphone" : "Mute microphone"}
                  </span>
                </Button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <Tabs defaultValue="participants">
                  <TabsList className="w-full">
                    <TabsTrigger value="participants" className="flex-1">
                      <Users className="mr-2 h-4 w-4" />
                      Participants
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex-1">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </TabsTrigger>
                  </TabsList>

                  {/* Participants tab */}
                  <TabsContent value="participants" className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <div className="font-medium">Host</div>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={debate.host.avatar || ""} alt={debate.host.name} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {debate.host.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{debate.host.name}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            {getLanguageDisplay(debate.host.preferredLanguage)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="font-medium">Participants</div>
                      <div className="space-y-2">
                        {debate.participants.map((participant) => (
                          <div key={participant._id} className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={participant.avatar || ""} alt={participant.name} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {participant.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="text-sm font-medium">{participant.name}</div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Globe className="h-3 w-3" />
                                {getLanguageDisplay(participant.preferredLanguage)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="font-medium">Topics</div>
                      <div className="flex flex-wrap gap-1">
                        {debate.topics.map((topic) => (
                          <Badge key={topic} variant="secondary">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Settings tab */}
                  <TabsContent value="settings" className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <div className="font-medium">Translation Language</div>
                      <Select
                        value={selectedLanguage}
                        onValueChange={setSelectedLanguage}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="zh">Chinese</SelectItem>
                          <SelectItem value="ja">Japanese</SelectItem>
                          <SelectItem value="ko">Korean</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="font-medium">Audio Settings</div>
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="range"
                          min="0"
                          max="100"
                          defaultValue="80"
                          className="h-4"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Speaker Volume</span>
                        <span className="text-sm">80%</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="font-medium">Share Debate</div>
                      <Button variant="outline" className="w-full" onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success("Link copied to clipboard");
                      }}>
                        <Share className="mr-2 h-4 w-4" />
                        Copy Link
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
