"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Loader2 } from "lucide-react"
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
  onTranscriptionStateChange?: (isTranscribing: boolean) => void;
}

const DebateVideoClient = ({ debateId, onTranscriptUpdate, onTranscriptionStateChange }: DebateVideoProps) => {
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
  
  // Transcription related states
  const transcriptContainerRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const fullRecordingChunks = useRef<Blob[]>([])   // store chunks until user stops
  const [transcript, setTranscript] = useState<string>("")
  const [isListening, setIsListening] = useState<boolean>(false)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null)
  const isMountedRef = useRef(true)
  
  // Check if browser supports MediaRecorder
  const isMediaRecorderSupported = typeof MediaRecorder !== 'undefined'
  
  // Toggle transcription on/off
  const toggleTranscription = async () => {
    if (isListening) {
      // User pressed again → stop & send
      await stopListeningAndSend();
    } else {
      // User pressed → start recording
      await startListening();
    }
  }
  
  // Start listening for speech
  const startListening = async () => {
    if (isListening) return
    
    try {
      // Reset any previous errors
      setTranscriptionError(null)
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioStreamRef.current = stream
      
      // Create MediaRecorder with specific MIME type for better compatibility
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      mediaRecorderRef.current = mediaRecorder
      
      // Reset audio chunks
      fullRecordingChunks.current = []
      
      // Set up event handlers
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          fullRecordingChunks.current.push(event.data)
          
          // Process the chunk immediately
          try {
            setIsProcessing(true)
            const webmBlob = new Blob([event.data], { type: 'audio/webm' })
            const arrayBuf = await webmBlob.arrayBuffer()
            const ctx = new AudioContext()
            const audioBuf = await ctx.decodeAudioData(arrayBuf)
            const wavBlob = await convertToWav(audioBuf)
            
            const text = await transcribeAudio(wavBlob)
            if (text && text.trim()) {
              setTranscript(prev => (prev ? prev + ' ' : '') + text)
              if (onTranscriptUpdate) {
                onTranscriptUpdate(text)
              }
            }
          } catch (error) {
            console.error("Error processing audio chunk:", error)
          } finally {
            setIsProcessing(false)
          }
        }
      }
      
      // Start recording with 5-second slices for natural conversation flow
      mediaRecorder.start(5000) // Process every 5 seconds
      setIsListening(true)
      onTranscriptionStateChange?.(true)
      
      console.log("Started recording audio for transcription")
    } catch (error) {
      console.warn("Error starting audio recording:", error)
      setTranscriptionError("Failed to access microphone. Please check permissions.")
      toast({ 
        title: "Transcription Error", 
        description: "Failed to access microphone. Please check permissions.", 
        variant: "destructive" 
      })
    }
  }
  
  // Stop listening and cleanup
  const stopListeningAndSend = async () => {
    if (!isListening) return
    
    try {
      setIsListening(false)
      onTranscriptionStateChange?.(false)
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      
      // Stop all tracks in the stream
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop())
        audioStreamRef.current = null
      }
      
      console.log("Stopped recording audio for transcription")
    } catch (error) {
      console.warn("Error stopping audio recording:", error)
    }
  }
  
  // Convert AudioBuffer to WAV format
  const convertToWav = (audioBuffer: AudioBuffer): Promise<Blob> => {
    return new Promise((resolve) => {
      const numOfChan = audioBuffer.numberOfChannels;
      const length = audioBuffer.length * numOfChan * 2;
      const buffer = new ArrayBuffer(length + 44);
      const view = new DataView(buffer);
      const channels = [];
      let offset = 0;
      let pos = 0;
      
      // Write WAV header
      writeUTFBytes(view, 0, 'RIFF');
      view.setUint32(4, 36 + length, true);
      writeUTFBytes(view, 8, 'WAVE');
      writeUTFBytes(view, 12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numOfChan, true);
      view.setUint32(24, audioBuffer.sampleRate, true);
      view.setUint32(28, audioBuffer.sampleRate * 2 * numOfChan, true);
      view.setUint16(32, numOfChan * 2, true);
      view.setUint16(34, 16, true);
      writeUTFBytes(view, 36, 'data');
      view.setUint32(40, length, true);
      
      // Write audio data
      for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        channels.push(audioBuffer.getChannelData(i));
      }
      
      while (pos < audioBuffer.length) {
        for (let i = 0; i < numOfChan; i++) {
          const sample = Math.max(-1, Math.min(1, channels[i][pos]));
          const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
          view.setInt16(44 + offset, int16, true);
          offset += 2;
        }
        pos++;
      }
      
      resolve(new Blob([buffer], { type: 'audio/wav' }));
    });
  };
  
  // Helper function to write UTF bytes
  const writeUTFBytes = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  // Function to transcribe audio using Hugging Face API
  const transcribeAudio = async (wavBlob: Blob): Promise<string> => {
    const maxRetries = 3
    let retryCount = 0
    
    while (retryCount < maxRetries) {
      try {
        const apiKey = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY
        
        if (!apiKey) {
          console.error("Hugging Face API key is missing")
          throw new Error("API key is missing. Please check your environment variables.")
        }
        
        console.log(`Sending audio to Hugging Face API (attempt ${retryCount + 1}/${maxRetries})...`)
        
        const response = await fetch('https://api-inference.huggingface.co/models/openai/whisper-small', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'audio/wav'
          },
          body: wavBlob
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error(`API error: ${response.status}`, errorText)
          
          if (response.status === 503) {
            console.log("Model is loading, waiting before retry...")
            await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)))
            retryCount++
            continue
          }
          
          throw new Error(`API error: ${response.status} - ${errorText}`)
        }
        
        const data = await response.json()
        console.log("Transcription result:", data)
        
        if (!data || !data.text) {
          console.warn("No transcription text in response:", data)
          return "No transcription available"
        }
        
        return data.text
      } catch (error) {
        console.error("Error in transcription attempt:", error)
        retryCount++
        
        if (retryCount === maxRetries) {
          throw error
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
      }
    }
    
    throw new Error("Failed to transcribe audio after multiple attempts")
  }
  
  // Scroll transcript into view
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight
    }
  }, [transcript])

  // Dynamically import Agora SDK on the client side only
  useEffect(() => {
    const loadAgoraSDK = async () => {
      try {
        // Use a more compatible approach to import the SDK
        const AgoraRTCModule = await import("agora-rtc-sdk-ng");
        const AgoraRTC = AgoraRTCModule.default || AgoraRTCModule;
        
        if (!AgoraRTC) {
          throw new Error("Failed to load Agora SDK module");
        }
        
        setAgoraRTC(AgoraRTC);
        
        // Initialize client with error handling
        try {
          const rtcClient = AgoraRTC.createClient({
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
    
    // Set mounted ref to true
    isMountedRef.current = true;
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
      
      // Clean up transcription resources
      stopListeningAndSend();
    };
  }, [toast]);

  // Handle visibility change (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Tab is hidden, but we don't want to disconnect from the call
        console.log("Tab hidden, call remains active");
      } else if (document.visibilityState === 'visible' && inCall) {
        // Tab is visible again and we're in a call
        console.log("Tab visible again, call is active");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [inCall]);

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
      if (client) {
        client.removeAllListeners()
      }
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

  // Cleanup function for component unmount
  useEffect(() => {
    return () => {
      // If we're in a call when the component unmounts, leave the call
      if (inCall && client) {
        console.log("Component unmounting, leaving call")
        leaveCall()
      }
      
      // Clean up transcription resources
      stopListeningAndSend();
    }
  }, [inCall, client])

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
      // Check if already in a call
      if (inCall) {
        console.log("Already in a call, not joining again")
        return
      }
      
      // Join the channel using the debate ID as the channel name
      const uid = await client.join(appId, debateId, null, null)
      console.log("Joined channel with UID:", uid)
      
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
    
    try {
      console.log("Leaving call")
      
      // Check if we're actually in a call before trying to unpublish
      if (inCall && localTracks) {
        try {
          // Unpublish tracks first
          await client.unpublish(localTracks)
          console.log("Unpublished local tracks")
        } catch (unpublishError) {
          console.error("Error unpublishing tracks:", unpublishError)
          // Continue with cleanup even if unpublish fails
        }
        
        // Close tracks
        try {
          localTracks[0].close()
          localTracks[1].close()
          console.log("Closed local tracks")
        } catch (closeError) {
          console.error("Error closing tracks:", closeError)
        }
      }
      
      // Leave the channel
      try {
        await client.leave()
        console.log("Left channel")
      } catch (leaveError) {
        console.error("Error leaving channel:", leaveError)
      }
      
      // Reset state
      setLocalTracks(null)
      setRemoteUsers([])
      setInCall(false)
      setLocalVideoTrackPlaying(false)
    } catch (error) {
      console.error("Error leaving call:", error)
      toast({
        title: "Error leaving call",
        description: "There was a problem leaving the call. Please try refreshing the page.",
        variant: "destructive",
      })
    }
  }

  // Update the toggleAudio function to handle both audio and transcription
  const toggleAudio = async () => {
    if (localTracks) {
      try {
        if (audioEnabled) {
          // If audio is enabled, disable it and stop transcription
          await localTracks[0].setEnabled(false)
          await stopListeningAndSend()
        } else {
          // If audio is disabled, enable it and start transcription
          await localTracks[0].setEnabled(true)
          await startListening()
        }
        setAudioEnabled(!audioEnabled)
      } catch (error) {
        console.error("Error toggling audio:", error)
      }
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
            <div className="flex items-center gap-2">
              {/* Single microphone button that handles both audio and transcription */}
              {inCall && (
                <Button
                  variant={audioEnabled ? "default" : "destructive"}
                  size="icon"
                  onClick={toggleAudio}
                  title={audioEnabled ? "Mute microphone" : "Unmute microphone"}
                >
                  {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
              )}
              
              {/* Video toggle button - only show if in call */}
              {inCall && (
                <Button
                  variant={videoEnabled ? "default" : "destructive"}
                  size="icon"
                  onClick={toggleVideo}
                  title={videoEnabled ? "Turn off camera" : "Turn on camera"}
                >
                  {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>
              )}
              
              {/* Leave call button - only show if in call */}
              {inCall && (
                <Button variant="destructive" onClick={leaveCall}>
                  <PhoneOff className="h-4 w-4 mr-2" />
                  Leave Call
                </Button>
              )}
            </div>
          </div>
          
          {/* Live Transcript Card - always show if MediaRecorder is supported */}
          {isMediaRecorderSupported && (
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" /> Live Transcript{" "}
                  {isProcessing ? (
                    <span className="text-xs text-yellow-500 flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Processing audio...
                    </span>
                  ) : isListening ? (
                    <span className="text-xs text-green-500 flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> Recording
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">(Click microphone to start)</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div ref={transcriptContainerRef} className="h-24 overflow-y-auto p-2 border rounded bg-muted text-sm">
                  {transcriptionError ? (
                    <div className="text-red-500">{transcriptionError}</div>
                  ) : transcript ? (
                    transcript
                  ) : (
                    <span className="text-muted-foreground">
                      {isListening 
                        ? "Listening... (transcription will appear here)"
                        : "Start speaking to see transcription..."}
                    </span>
                  )}
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