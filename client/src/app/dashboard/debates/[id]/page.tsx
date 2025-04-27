"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { use } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, MessageCircle, Mic, MicOff, Users, Volume2, Settings, Share, Clock, X, Check, Video } from "lucide-react";
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
import DebateVideo from "@/components/debate-video";


interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface TranslationResponse {
  translatedText: string;
}

interface MessageResponse {
  success: boolean;
  message: Message;
}

interface User {
  _id: string;
  name: string;
  avatar?: string;
  preferredLanguage?: string;
}

interface Message {
  user: User;
  text: string;
  translatedText?: string;
  translatedTexts?: Record<string, string>;
  timestamp: string;
}

interface DebateParticipant {
  user: User;
  joinedAt: string;
  leftAt?: string;
  isActive: boolean;
}

interface Debate {
  _id: string;
  title: string;
  description: string;
  status: string;
  startTime?: string;
  endTime?: string;
  timeLimit?: number;
  host: User;
  languages: string[];
  topics: string[];
  participants: DebateParticipant[];
  capacity: number;
  messages: Message[];
  settings?: {
    allowAnonymous: boolean;
    requireApproval: boolean;
    autoTranslate: boolean;
  };
}

interface PageParams {
  id: string;
}

export default function DebatePage({ params }: { params: PageParams }) {
  const { id: debateId } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [debate, setDebate] = useState<Debate | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Enhanced auto-scroll function
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, []);

  // Socket event handlers
  const handleNewMessage = useCallback((newMessage: Message) => {
    console.log('Handling new message:', newMessage);
    setDebate(prev => {
      if (!prev) return null;
      // Check if message already exists to prevent duplicates
      const messageExists = prev.messages.some(
        msg => msg.timestamp === newMessage.timestamp && msg.user._id === newMessage.user._id
      );
      if (messageExists) {
        return prev;
      }
      return {
        ...prev,
        messages: [...prev.messages, newMessage]
      };
    });
    // Scroll to bottom after a short delay to ensure the new message is rendered
    setTimeout(scrollToBottom, 100);
  }, [scrollToBottom]);

  const handleParticipantJoined = useCallback((participant: DebateParticipant) => {
    setDebate(prev => {
      if (!prev) return null;
      return {
        ...prev,
        participants: [...prev.participants, participant]
      };
    });
  }, []);

  const handleParticipantLeft = useCallback((participantId: string) => {
    setDebate(prev => {
      if (!prev) return null;
      return {
        ...prev,
        participants: prev.participants.map(p => 
          p.user._id === participantId ? { ...p, isActive: false, leftAt: new Date().toISOString() } : p
        )
      };
    });
  }, []);

  const handleStatusUpdated = useCallback((status: string) => {
    setDebate(prev => {
      if (!prev) return null;
      return { ...prev, status };
    });
  }, []);

  const handleSettingsUpdated = useCallback((settings: Debate['settings']) => {
    setDebate(prev => {
      if (!prev) return null;
      return { ...prev, settings };
    });
  }, []);

  // Initialize socket connection
  const socket = useDebateSocket(
    debateId as string,
    handleNewMessage,
    handleParticipantJoined,
    handleParticipantLeft,
    handleStatusUpdated,
    handleSettingsUpdated
  );

  // Re-join debate room when socket reconnects
  useEffect(() => {
    if (socket && debateId) {
      socket.emit('join-debate', { debateId });
    }
  }, [socket, debateId]);

  // Auto-join debate for logged-in users
  useEffect(() => {
    if (
      user &&
      debate &&
      !debate.participants.some(p => p.user._id === user._id && p.isActive)
    ) {
      handleJoinDebate();
    }
  }, [user, debate]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [debate?.messages, scrollToBottom]);

  useEffect(() => {
    if (!debateId) {
      setError("Debate ID is required");
      setLoading(false);
      return;
    }

    const fetchDebate = async () => {
      try {
        console.log('Fetching debate with ID:', debateId);
        const response = await api.getDebateById(debateId as string) as ApiResponse<Debate>;
        console.log('Debate response:', response);
        if (response.success && response.data) {
          const debateData = response.data;
          if (debateData._id && debateData.title && debateData.description && debateData.status && debateData.host && debateData.languages && debateData.topics && debateData.participants && debateData.capacity) {
            const validDebate: Debate = {
              _id: debateData._id,
              title: debateData.title,
              description: debateData.description,
              status: debateData.status,
              host: debateData.host,
              languages: debateData.languages,
              topics: debateData.topics,
              participants: debateData.participants,
              capacity: debateData.capacity,
              messages: debateData.messages || []
            };
            setDebate(validDebate);
            setError(null);
          } else {
            console.error('Invalid debate data structure:', debateData);
            setError('Invalid debate data received from server');
          }
        } else {
          console.error('Failed to fetch debate:', response);
          setError(response.message || 'Failed to load debate');
        }
      } catch (error) {
        console.error('Error fetching debate:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDebate();
  }, [debateId]);

  useEffect(() => {
    if (remainingTime !== null && remainingTime > 0) {
      timerRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev === null || prev <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [remainingTime]);

  useEffect(() => {
    if (remainingTime === 0 && debate?.status === 'active') {
      handleEndDebate();
    }
  }, [remainingTime, debate?.status]);

  const handleJoinDebate = async () => {
    if (!debateId || !user) return;
    try {
      const res = await api.joinDebate(debateId as string) as ApiResponse<Debate>;
      if (res.success && res.data) {
        const debateData = res.data;
        if (debateData._id && debateData.title && debateData.description && debateData.status && debateData.host && debateData.languages && debateData.topics && debateData.participants && debateData.capacity) {
          const validDebate: Debate = {
            _id: debateData._id,
            title: debateData.title,
            description: debateData.description,
            status: debateData.status,
            host: debateData.host,
            languages: debateData.languages,
            topics: debateData.topics,
            participants: debateData.participants,
            capacity: debateData.capacity,
            timeLimit: debateData.timeLimit || 0,
            startTime: debateData.startTime || new Date().toISOString(),
            endTime: debateData.endTime || undefined,
            messages: debateData.messages || [],
            settings: debateData.settings || { allowAnonymous: false, requireApproval: false, autoTranslate: false }
          };
          setDebate(validDebate);
          toast.success("Joined debate successfully");
        } else {
          toast.error("Invalid debate data received");
        }
      } else {
        toast.error(res.error || "Failed to join debate");
      }
    } catch (err) {
      toast.error("Failed to join debate");
    }
  };

  const handleLeaveDebate = async () => {
    if (!debate) return;

    try {
      const response = await api.leaveDebate(debate._id) as ApiResponse<Debate>;
      if (response.success) {
        toast.success("Left debate successfully");
        router.push("/dashboard");
      } else {
        toast.error(response.error || "Failed to leave debate");
      }
    } catch (err) {
      toast.error("Failed to leave debate");
      console.error("Error leaving debate:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !debate || !user) {
      console.log('Cannot send message: missing required data', { 
        hasMessage: !!message.trim(), 
        hasDebate: !!debate, 
        hasUser: !!user 
      });
      return;
    }
    
    // Check if user is a participant
    const isParticipant = debate.participants.some(p => p.user && p.user._id === user._id && p.isActive);
    if (!isParticipant) {
      toast.error("You must be a participant to send messages");
      return;
    }

    try {
      // Find other participants with different languages
      const otherParticipants = debate.participants
        .filter(p => p.isActive && p.user._id !== user._id)
        .map(p => p.user);

      const translatedTexts: Record<string, string> = {};
      const currentUserLang = user.preferredLanguage || 'en';

      // Translate message for each participant with a different language
      for (const participant of otherParticipants) {
        const targetLang = participant.preferredLanguage || 'en';
        if (targetLang !== currentUserLang) {
          try {
            const response = await api.translateText(message, currentUserLang, targetLang) as TranslationResponse;
            if (response.translatedText) {
              translatedTexts[targetLang] = response.translatedText;
            }
          } catch (error) {
            console.error('Translation error:', error);
          }
        }
      }

      // Create a temporary message for immediate display
      const tempMessage: Message = {
        user: {
          _id: user._id,
          name: user.name,
          avatar: user.avatar,
          preferredLanguage: user.preferredLanguage
        },
        text: message,
        translatedTexts,
        timestamp: new Date().toISOString()
      };

      // Add the message to the UI immediately
      setDebate(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, tempMessage]
        };
      });

      // Clear the input field
      setMessage("");

      // Send the message to the server
      const response = await api.sendMessage(debate._id, {
        text: message,
        translatedTexts
      }) as MessageResponse;

      // Emit message through socket
      if (socket) {
        socket.emit('send-message', { 
          debateId: debate._id, 
          message: tempMessage 
        });
      } else {
        toast.error("Failed to send message");
      }
    } catch (err) {
      toast.error("Failed to send message");
      console.error("Error sending message:", err);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!debate || !user || user._id !== debate.host._id || !debateId) return;
    try {
      const res = await api.updateDebateStatus(debateId as string, status) as ApiResponse<Debate>;
      if (res.success && res.data) {
        const debateData = res.data;
        if (debateData._id && debateData.title && debateData.description && debateData.status && debateData.host && debateData.languages && debateData.topics && debateData.participants && debateData.capacity) {
          const validDebate: Debate = {
            _id: debateData._id,
            title: debateData.title,
            description: debateData.description,
            status: debateData.status,
            host: debateData.host,
            languages: debateData.languages,
            topics: debateData.topics,
            participants: debateData.participants,
            capacity: debateData.capacity,
            timeLimit: debateData.timeLimit || 0,
            startTime: debateData.startTime || new Date().toISOString(),
            endTime: debateData.endTime || undefined,
            messages: debateData.messages || []
          };
          setDebate(validDebate);
          toast.success(`Debate status updated to ${status}`);
        } else {
          toast.error("Invalid debate data received");
        }
      } else {
        toast.error(res.error || "Failed to update debate status");
      }
    } catch (err) {
      toast.error("Failed to update debate status");
    }
  };

  const handleUpdateSettings = async (settings: { allowAnonymous: boolean; requireApproval: boolean; autoTranslate: boolean; }) => {
    if (!debate || !user || user._id !== debate.host._id || !debateId) return;
    try {
      // Always set autoTranslate to true since we're always translating messages
      const updatedSettings = {
        ...settings,
        autoTranslate: true
      };
      
      const res = await api.updateDebateSettings(debateId as string, updatedSettings) as ApiResponse<Debate>;
      if (res.success && res.data) {
        const debateData = res.data;
        if (debateData._id && debateData.title && debateData.description && debateData.status && debateData.host && debateData.languages && debateData.topics && debateData.participants && debateData.capacity) {
          const validDebate: Debate = {
            _id: debateData._id,
            title: debateData.title,
            description: debateData.description,
            status: debateData.status,
            host: debateData.host,
            languages: debateData.languages,
            topics: debateData.topics,
            participants: debateData.participants,
            capacity: debateData.capacity,
            timeLimit: debateData.timeLimit || 0,
            startTime: debateData.startTime || new Date().toISOString(),
            endTime: debateData.endTime || undefined,
            messages: debateData.messages || [],
            settings: updatedSettings
          };
          setDebate(validDebate);
          // Emit settings update through socket
          if (socket) {
            socket.emit('update-settings', { debateId, settings: updatedSettings });
          }
          toast.success("Debate settings updated");
        } else {
          toast.error("Invalid debate data received");
        }
      } else {
        toast.error(res.error || "Failed to update debate settings");
      }
    } catch (err) {
      toast.error("Failed to update debate settings");
    }
  };

  const handleEndDebate = async () => {
    if (!debate) return;

    try {
      const response = await api.endDebate(debate._id) as ApiResponse<Debate>;
      if (response.success && response.data) {
        const debateData = response.data;
        if (debateData._id && debateData.title && debateData.description && debateData.status && debateData.host && debateData.languages && debateData.topics && debateData.participants && debateData.capacity) {
          const validDebate: Debate = {
            _id: debateData._id,
            title: debateData.title,
            description: debateData.description,
            status: debateData.status,
            host: debateData.host,
            languages: debateData.languages,
            topics: debateData.topics,
            participants: debateData.participants,
            capacity: debateData.capacity,
            timeLimit: debateData.timeLimit || 0,
            startTime: debateData.startTime || new Date().toISOString(),
            endTime: debateData.endTime || undefined,
            messages: debateData.messages || []
          };
          setDebate(validDebate);
          toast.success("Debate ended successfully");
          router.push("/dashboard");
        } else {
          toast.error("Invalid debate data received");
        }
      } else {
        toast.error(response.error || "Failed to end debate");
      }
    } catch (err) {
      toast.error("Failed to end debate");
      console.error("Error ending debate:", err);
    }
  };

  // Add handler for transcript updates
  const handleTranscriptUpdate = (transcript: string) => {
    // You can use this transcript to update the chat or store it
    console.log("Transcript updated:", transcript);
  };

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

  const isHost = user && debate && user._id === debate.host._id;
  const isParticipant = user && debate && debate.participants.some(p => p.user && p.user._id === user._id && p.isActive);
  const canSendMessages = debate.status === 'active' && isParticipant && 
    (!debate.startTime || new Date(debate.startTime) <= new Date());

  return (
    <DashboardLayout user={user}>
      <div className="container mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{debate.title}</h1>
            <p className="text-muted-foreground">{debate.description}</p>
          </div>
          <div className="flex items-center gap-4">
            {remainingTime !== null && debate.status === 'active' && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {participantCount}/{debate.capacity}
              </span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat">
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="video">
              <Video className="h-4 w-4 mr-2" />
              Video
            </TabsTrigger>
            <TabsTrigger value="participants">
              <Users className="h-4 w-4 mr-2" />
              Participants
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Discussion</CardTitle>
                <CardDescription>
                  {debate.status === 'scheduled' ? (
                    <div className="flex items-center gap-2 text-yellow-500">
                      <Clock className="h-4 w-4" />
                      <span>Debate starts at {new Date(debate.startTime!).toLocaleString()}</span>
                    </div>
                  ) : debate.status === 'ended' ? (
                    <div className="flex items-center gap-2 text-red-500">
                      <X className="h-4 w-4" />
                      <span>Debate has ended</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-500">
                      <Check className="h-4 w-4" />
                      <span>Debate is active</span>
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea ref={scrollAreaRef} className="h-[400px] pr-4">
                  <div className="space-y-4">
                    <AnimatePresence>
                      {debate.messages.map((msg, index) => (
                        <motion.div
                          key={`${msg.user._id}-${msg.timestamp}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-start gap-3"
                        >
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            {msg.user.avatar ? (
                              <img
                                src={msg.user.avatar}
                                alt={msg.user.name}
                                className="h-8 w-8 rounded-full"
                              />
                            ) : (
                              <span className="text-sm font-medium">
                                {msg.user.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{msg.user.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm mt-1">{msg.text}</p>
                            
                            {/* Display translation for current user's preferred language if available */}
                            {user && msg.user._id !== user._id && 
                             msg.translatedTexts && 
                             msg.translatedTexts[user.preferredLanguage || 'en'] && (
                              <div className="mt-1 pt-1 border-t border-opacity-20">
                                <p className="text-sm text-muted-foreground italic">
                                  {msg.translatedTexts[user.preferredLanguage || 'en']}
                                </p>
                              </div>
                            )}
                            
                            {/* Display all translations for debugging */}
                            {msg.translatedTexts && Object.entries(msg.translatedTexts).map(([lang, text]) => (
                              <div key={lang} className="mt-2 pt-2 border-t border-opacity-20">
                                <p className="text-xs opacity-70">
                                  {getLanguageDisplay(lang)}: {text}
                                </p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <div className="flex w-full gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={!canSendMessages}
                  />
                  <Button 
                    onClick={(e) => handleSendMessage()}
                    disabled={!canSendMessages}
                  >
                    Send
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="video" className="space-y-4">
            <DebateVideo 
              debateId={debateId as string} 
              onTranscriptUpdate={handleTranscriptUpdate}
            />
          </TabsContent>
          
          <TabsContent value="participants" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Participants</CardTitle>
                <CardDescription>
                  {participantCount} active participants
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeParticipants.map((participant) => (
                  <div key={participant.user._id} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {participant.user.avatar ? (
                        <img
                          src={participant.user.avatar}
                          alt={participant.user.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {participant.user.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{participant.user.name}</div>
                      {participant.user._id === debate.host._id && (
                        <Badge variant="secondary" className="text-xs">
                          Host
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium">Languages</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {debate.languages.map((lang) => (
                      <Badge key={lang} variant="outline">
                        {getLanguageDisplay(lang)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Topics</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {debate.topics.map((topic) => (
                      <Badge key={topic} variant="outline">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {isHost && (
                  <div className="pt-4 border-t">
                    <div className="text-sm font-medium mb-2">Debate Settings</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Messages are automatically translated to each participant's preferred language</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {isHost ? (
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleEndDebate}
                    disabled={debate.status === 'ended'}
                  >
                    End Debate
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleLeaveDebate}
                  >
                    Leave Debate
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
