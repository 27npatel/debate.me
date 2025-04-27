"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, MicOff, Video, VideoOff, PhoneOff, Bot } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"

// Types for Agora
type IAgoraRTCClient = any
type IAgoraRTCRemoteUser = any
type ICameraVideoTrack = any
type IMicrophoneAudioTrack = any

interface DebateVideoProps {
  debateId: string;
  onTranscriptUpdate?: (transcript: string) => void;
}

const DebateVideoClient = ({ debateId, onTranscriptUpdate }: DebateVideoProps) => {
  const { toast } = useToast()
  const [inCall, setInCall] = useState(false)
  const [localTracks, setLocalTracks] = useState<[IMicrophoneAudioTrack, ICameraVideoTrack] | null>(null)
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([])
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [AgoraRTC, setAgoraRTC] = useState<any>(null)
  const [client, setClient] = useState<IAgoraRTCClient | null>(null)
  const [localVideoTrackPlaying, setLocalVideoTrackPlaying] = useState(false)
  const localVideoRef = useRef<HTMLDivElement>(null)
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || ""
  
  // Speech transcription related states and refs
  const transcriptContainerRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const [transcript, setTranscript] = useState<string>("")
  const [isListening, setIsListening] = useState<boolean>(false)
  const [hasStarted, setHasStarted] = useState<boolean>(false)
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false)
  
  // Initialize Web Speech API
  useEffect(() => {
    // Check for Speech Recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setSpeechRecognitionSupported(!!SpeechRecognition)
    if (!SpeechRecognition) return
    
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"
    
    let finalTranscript = ""
    recognition.onresult = (e: any) => {
      let interim = ""
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript
        else interim += e.results[i][0].transcript
      }
      const newTranscript = finalTranscript + interim
      setTranscript(newTranscript)
      if (onTranscriptUpdate) {
        onTranscriptUpdate(newTranscript)
      }
    }
    
    recognition.onerror = (e: any) => {
      if (["no-speech", "audio-capture", "not-allowed"].includes(e.error)) {
        stopListening()
        toast({ title: "Transcription Error", description: e.error, variant: "destructive" })
      }
    }
    
    recognition.onend = () => {
      if (isListening) {
        try {
          recognition.start()
        } catch {}
      }
    }
  }, [toast, onTranscriptUpdate])
  
  // Push-to-talk handlers
  const startListening = () => {
    if (!speechRecognitionSupported || isListening) return
    if (!hasStarted) {
      setTranscript("")
      setHasStarted(true)
    }
    recognitionRef.current.start()
    setIsListening(true)
  }
  
  const stopListening = () => {
    if (!speechRecognitionSupported || !isListening) return
    recognitionRef.current.stop()
    setIsListening(false)
  }
  
  // Auto-scroll transcript container
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight
    }
  }, [transcript])

  // Dynamically import Agora SDK on the client side only
  useEffect(() => {
    const loadAgoraSDK = async () => {
      try {
        // First try to import the module
        const AgoraRTCModule = await import("agora-rtc-sdk-ng");
        if (!AgoraRTCModule || !AgoraRTCModule.default) {
          throw new Error("Failed to load Agora SDK module");
        }
        setAgoraRTC(AgoraRTCModule.default);
        
        // Initialize client with error handling
        try {
          const rtcClient = AgoraRTCModule.default.createClient({
            mode: "rtc",
            codec: "vp8",
          });
          setClient(rtcClient);
        } catch (error) {
          console.error("Failed to create Agora client:", error);
          toast({
            title: "Error",
            description: "Failed to initialize video call client. Please try refreshing the page.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to load Agora SDK:", error);
        toast({
          title: "Error",
          description: "Failed to load video call capabilities. Please check your internet connection and try again.",
          variant: "destructive",
        });
      }
    };
    loadAgoraSDK();
  }, [toast]);

  // Set up event listeners for remote users
  useEffect(() => {
    if (!client) return
    const setupEventListeners = () => {
      client.on("user-published", async (user: any, mediaType: string) => {
        await client.subscribe(user, mediaType)
        if (mediaType === "video") {
          setRemoteUsers((prevUsers) => {
            if (prevUsers.find((u) => u.uid === user.uid)) {
              return prevUsers.map((u) => (u.uid === user.uid ? user : u))
            } else {
              return [...prevUsers, user]
            }
          })
        }
        if (mediaType === "audio") {
          user.audioTrack?.play()
        }
      })
      client.on("user-unpublished", (user: any, mediaType: string) => {
        if (mediaType === "audio") {
          user.audioTrack?.stop()
        }
        if (mediaType === "video") {
          setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid))
        }
      })
      client.on("user-left", (user: any) => {
        setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid))
      })
    }
    setupEventListeners()
    // Clean up when component unmounts
    return () => {
      client.removeAllListeners()
    }
  }, [client])

  // Handle local video display
  useEffect(() => {
    const playLocalVideo = async () => {
      if (!localTracks || !localVideoRef.current) return
      try {
        // First, make sure any previous instances are cleaned up
        if (localVideoTrackPlaying) {
          localTracks[1].stop()
        }
        // Clear the container
        if (localVideoRef.current) {
          localVideoRef.current.innerHTML = ""
        }
        // Create a new video element
        const videoElement = document.createElement("video")
        videoElement.setAttribute("autoplay", "true")
        videoElement.setAttribute("playsinline", "true")
        videoElement.setAttribute("muted", "true")
        videoElement.style.width = "100%"
        videoElement.style.height = "100%"
        videoElement.style.objectFit = "cover"
        // Append the video element to our container
        localVideoRef.current.appendChild(videoElement)
        // Get the MediaStream from the video track and attach it to the video element
        const mediaStream = new MediaStream([localTracks[1].getMediaStreamTrack()])
        videoElement.srcObject = mediaStream
        // Log success
        console.log("Local video element created and stream attached")
        setLocalVideoTrackPlaying(true)
      } catch (error) {
        console.error("Error playing local video:", error)
        setLocalVideoTrackPlaying(false)
      }
    }
    if (localTracks && localTracks[1]) {
      // Try immediately and then with a delay to ensure DOM is ready
      playLocalVideo()
      setTimeout(playLocalVideo, 500)
    }
    return () => {
      if (localTracks && localTracks[1] && localVideoTrackPlaying) {
        localTracks[1].stop()
        setLocalVideoTrackPlaying(false)
      }
    }
  }, [localTracks, localVideoTrackPlaying])

  // Join the channel and start the call
  const joinCall = async () => {
    if (!appId) {
      toast({
        title: "Error",
        description: "Agora App ID is missing. Please check your environment variables.",
        variant: "destructive",
      })
      return
    }
    if (!client || !AgoraRTC) {
      toast({
        title: "Error",
        description: "Agora SDK is not loaded yet. Please try again.",
        variant: "destructive",
      })
      return
    }
    try {
      // Join the channel using the debate ID as the channel name
      const uid = await client.join(appId, debateId, null, null)
      // Create local audio and video tracks with specific constraints for better compatibility
      const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
        {},
        {
          encoderConfig: "high_quality",
          facingMode: "user",
        },
      )
      setLocalTracks([microphoneTrack, cameraTrack])
      // Debug message
      console.log("Local tracks created:", microphoneTrack, cameraTrack)
      // Publish local tracks
      await client.publish([microphoneTrack, cameraTrack])
      console.log("Local tracks published successfully")
      setInCall(true)
    } catch (error) {
      console.error("Error joining call:", error)
      toast({
        title: "Error joining call",
        description: "Please check your camera and microphone permissions.",
        variant: "destructive",
      })
    }
  }

  // Leave the call and clean up
  const leaveCall = async () => {
    if (!client) return
    if (localTracks) {
      localTracks[0].close()
      localTracks[1].close()
    }
    await client.leave()
    setLocalTracks(null)
    setRemoteUsers([])
    setInCall(false)
    setLocalVideoTrackPlaying(false)
  }

  // Toggle audio mute
  const toggleAudio = async () => {
    if (localTracks) {
      if (audioEnabled) {
        await localTracks[0].setEnabled(false)
      } else {
        await localTracks[0].setEnabled(true)
      }
      setAudioEnabled(!audioEnabled)
    }
  }

  // Toggle video mute
  const toggleVideo = async () => {
    if (localTracks) {
      try {
        // Toggle the video track's enabled state
        await localTracks[1].setEnabled(!videoEnabled)
        setVideoEnabled(!videoEnabled)
        // If we're enabling the video, we need to make sure it displays properly
        if (!videoEnabled) {
          // We'll force a refresh of the local video display
          setTimeout(() => {
            if (localVideoRef.current && localTracks) {
              // Clear the container
              localVideoRef.current.innerHTML = ""
              // Create a new video element
              const videoElement = document.createElement("video")
              videoElement.setAttribute("autoplay", "true")
              videoElement.setAttribute("playsinline", "true")
              videoElement.setAttribute("muted", "true")
              videoElement.style.width = "100%"
              videoElement.style.height = "100%"
              videoElement.style.objectFit = "cover"
              // Append the video element to our container
              localVideoRef.current.appendChild(videoElement)
              // Get the MediaStream from the video track and attach it to the video element
              const mediaStream = new MediaStream([localTracks[1].getMediaStreamTrack()])
              videoElement.srcObject = mediaStream
              console.log("Local video re-enabled and displayed")
            }
          }, 100)
        }
      } catch (error) {
        console.error("Error toggling video:", error)
      }
    }
  }

  // Render remote user videos
  const renderRemoteVideos = () => {
    return remoteUsers.map((user) => (
      <div key={user.uid} className="w-full h-full">
        <div
          id={`remote-${user.uid}`}
          className="w-full h-full bg-gray-800 rounded-lg overflow-hidden"
          ref={(el) => {
            if (el && user.videoTrack) {
              user.videoTrack.play(el)
            }
          }}
        />
      </div>
    ))
  }

  // If Agora SDK is not loaded yet, show loading state
  if (!AgoraRTC || !client) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center p-8">
            <p>Loading video call capabilities...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {!inCall ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <Button onClick={joinCall} className="w-full">
                Join Video Call
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
            <div ref={localVideoRef} className="w-full h-full" id="local-video-container" />
            <div className="absolute bottom-2 left-2 text-white bg-black/50 px-2 py-1 rounded text-sm">You</div>
            {!videoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                <VideoOff className="h-12 w-12 text-white/60" />
              </div>
            )}
          </div>
          {remoteUsers.length > 0 ? (
            <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
              {renderRemoteVideos()}
              <div className="absolute bottom-2 left-2 text-white bg-black/50 px-2 py-1 rounded text-sm">Participant</div>
            </div>
          ) : (
            <div className="flex items-center justify-center aspect-video bg-gray-800 rounded-lg">
              <p className="text-white">Waiting for others to join...</p>
            </div>
          )}
          <div className="col-span-1 md:col-span-2 flex justify-center gap-2 py-4">
            {/* Push-to-talk button for transcription */}
            <Button
              variant={isListening ? "destructive" : "default"}
              size="icon"
              onMouseDown={startListening}
              onMouseUp={stopListening}
              onMouseLeave={stopListening}
              title="Hold to transcribe speech"
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              variant={audioEnabled ? "default" : "destructive"}
              size="icon"
              onClick={toggleAudio}
              title={audioEnabled ? "Mute microphone" : "Unmute microphone"}
            >
              {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
            <Button
              variant={videoEnabled ? "default" : "destructive"}
              size="icon"
              onClick={toggleVideo}
              title={videoEnabled ? "Turn off camera" : "Turn on camera"}
            >
              {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
            <Button variant="destructive" onClick={leaveCall}>
              <PhoneOff className="h-4 w-4 mr-2" />
              Leave Call
            </Button>
          </div>
          
          {/* Live Transcript Card */}
          {speechRecognitionSupported && (
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" /> Live Transcript{" "}
                  {isListening ? (
                    <span className="text-xs text-green-500">(Listening)</span>
                  ) : (
                    <span className="text-xs text-gray-500">(Paused)</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div ref={transcriptContainerRef} className="h-24 overflow-y-auto p-2 border rounded bg-muted text-sm">
                  {transcript ||
                    (!hasStarted ? <span className="text-muted-foreground">Hold mic button to speak...</span> : null)}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

// Use dynamic import with SSR disabled for the DebateVideoClient component
const DebateVideo = dynamic(() => Promise.resolve(DebateVideoClient), {
  ssr: false,
})

export default DebateVideo 