"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { useDebateSocket } from '@/hooks/use-debate-socket';
import { motion, AnimatePresence } from 'framer-motion';


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

interface DebateParticipant {
  user: DebateUser;
  joinedAt: string;
  leftAt?: string;
  isActive: boolean;
}

interface DebateSettings {
  allowAnonymous: boolean;
  requireApproval: boolean;
  autoTranslate: boolean;
}

interface Debate {
  _id: string;
  title: string;
  description: string;
  status: string;
  startTime?: string;
  endTime?: string;
  host: DebateUser;
  languages: string[];
  topics: string[];
  participants: DebateParticipant[];
  capacity: number;
  messages: Message[];
  settings: DebateSettings;
}

interface ApiResponse<T> {
  success: boolean;
  error?: string;
  debate?: T;
  message?: Message;
}

export default function DebatePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [debate, setDebate] = useState<Debate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(user?.preferredLanguage || "en");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const fetchDebate = async () => {
      setLoading(true);
      try {
        const res = await api.getDebateById(id as string) as ApiResponse<Debate>;
        if (res.success && res.debate) {
          setDebate(res.debate);
          setIsParticipant(res.debate.participants.some(
            (p) => p.user._id === user?._id && p.isActive
          ));
          setIsHost(res.debate.host._id === user?._id);
        } else {
          setError(res.error || "Failed to load debate");
        }
      } catch (err) {
        setError("Failed to load debate");
      } finally {
        setLoading(false);
      }
    };
    fetchDebate();
  }, [id, user]);

  // Enhanced auto-scroll function
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, []);

  // Auto-scroll when messages change, component mounts, or participant status changes
  useEffect(() => {
    scrollToBottom();
  }, [debate?.messages, isParticipant, scrollToBottom]);

  // Auto-scroll when new messages are added
  useEffect(() => {
    if (debate?.messages && debate.messages.length > 0) {
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [debate?.messages, scrollToBottom]);

  const handleJoinDebate = async () => {
    try {
      const res = await api.joinDebate(id as string) as ApiResponse<Debate>;
      if (res.success && res.debate) {
        setDebate(res.debate);
        setIsParticipant(true);
        toast.success("Joined debate successfully");
      } else {
        toast.error(res.error || "Failed to join debate");
      }
    } catch (err) {
      toast.error("Failed to join debate");
    }
  };

  const handleLeaveDebate = async () => {
    try {
      const res = await api.leaveDebate(id as string) as ApiResponse<Debate>;
      if (res.success) {
        toast.success("Left debate successfully");
        router.push("/dashboard");
      } else {
        console.error("Leave debate error:", res.error);
        toast.error(res.error || "Failed to leave debate");
      }
    } catch (err) {
      console.error("Leave debate error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to leave debate");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isParticipant || !user) return;

    // Create optimistic message with a unique temporary ID
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const optimisticMessage: Message = {
      _id: tempId,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        preferredLanguage: user.preferredLanguage,
        avatar: user.avatar
      },
      text: newMessage,
      timestamp: new Date().toISOString()
    };

    // Update UI immediately
    setDebate(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, optimisticMessage]
      };
    });
    setNewMessage("");

    // Scroll to bottom after state update
    setTimeout(scrollToBottom, 100);

    try {
      const res = await api.sendMessage(id as string, { text: newMessage }) as ApiResponse<Message>;
      if (res.success && res.message) {
        // Replace optimistic message with real message
        setDebate(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map(msg => 
              msg._id === tempId ? res.message! : msg
            )
          };
        });
      } else {
        // Remove optimistic message if send failed
        setDebate(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.filter(msg => msg._id !== tempId)
          };
        });
        toast.error(res.error || "Failed to send message");
      }
    } catch (err) {
      // Remove optimistic message on error
      setDebate(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.filter(msg => msg._id !== tempId)
        };
      });
      toast.error("Failed to send message");
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!isHost) return;
    try {
      const res = await api.updateDebateStatus(id as string, status) as ApiResponse<Debate>;
      if (res.success && res.debate) {
        setDebate(res.debate);
        toast.success(`Debate status updated to ${status}`);
      } else {
        toast.error(res.error || "Failed to update debate status");
      }
    } catch (err) {
      toast.error("Failed to update debate status");
    }
  };

  const handleUpdateSettings = async (settings: DebateSettings) => {
    if (!isHost) return;
    try {
      const res = await api.updateDebateSettings(id as string, settings) as ApiResponse<Debate>;
      if (res.success && res.debate) {
        setDebate(res.debate);
        toast.success("Debate settings updated");
      } else {
        toast.error(res.error || "Failed to update debate settings");
      }
    } catch (err) {
      toast.error("Failed to update debate settings");
    }
  };

  // WebSocket handlers
  const handleNewMessage = useCallback((message: Message) => {
    setDebate(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, message]
      };
    });
  }, []);

  const handleParticipantJoined = useCallback((participant: DebateParticipant) => {
    setDebate(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        participants: [...prev.participants, participant]
      };
    });
  }, []);

  const handleParticipantLeft = useCallback((participantId: string) => {
    setDebate(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        participants: prev.participants.map(p => 
          p.user._id === participantId ? { ...p, isActive: false, leftAt: new Date().toISOString() } : p
        )
      };
    });
  }, []);

  const handleStatusUpdated = useCallback((status: string, endTime?: Date) => {
    setDebate(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        status,
        endTime: endTime?.toISOString()
      };
    });
  }, []);

  const handleSettingsUpdated = useCallback((settings: DebateSettings) => {
    setDebate(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        settings: { ...prev.settings, ...settings }
      };
    });
  }, []);

  // Initialize WebSocket
  useDebateSocket(
    id as string,
    handleNewMessage,
    handleParticipantJoined,
    handleParticipantLeft,
    handleStatusUpdated,
    handleSettingsUpdated
  );

  if (!user) {
    return (
      <DashboardLayout user={user}>
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

  // Calculate participant count
  const activeParticipants = debate.participants.filter(p => p.isActive);
  const participantCount = activeParticipants.length;

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
            {!isParticipant && debate.status === "active" && (
              <Button onClick={handleJoinDebate}>Join Debate</Button>
            )}
            {isParticipant && debate.status === "active" && (
              <Button variant="destructive" onClick={handleLeaveDebate}>Leave Debate</Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          {/* Main debate area */}
          <div className="flex h-[calc(100vh-250px)] flex-col overflow-hidden rounded-lg border bg-background">
            {/* Conversation area */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea ref={scrollAreaRef} className="h-full">
                <div className="flex flex-col gap-4 p-4">
                  <AnimatePresence mode="popLayout">
                    {debate.messages.map((message) => (
                      <motion.div
                        key={message._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col gap-2"
                      >
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
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} className="h-0" />
                </div>
              </ScrollArea>
            </div>

            {/* Input area */}
            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isParticipant ? "Type your message..." : "Join the debate to chat"}
                  className="flex-1"
                  disabled={!isParticipant}
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim() || !isParticipant}>
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
                        {activeParticipants.map((participant) => (
                          <div key={participant.user._id} className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={participant.user.avatar || ""} alt={participant.user.name} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {participant.user.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="text-sm font-medium">{participant.user.name}</div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Globe className="h-3 w-3" />
                                {getLanguageDisplay(participant.user.preferredLanguage)}
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
                    {isHost && (
                      <>
                        <div className="space-y-2">
                          <div className="font-medium">Debate Status</div>
                          <Select
                            value={debate.status}
                            onValueChange={handleUpdateStatus}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="ended">Ended</SelectItem>
                              <SelectItem value="scheduled">Scheduled</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Separator />
                      </>
                    )}

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
