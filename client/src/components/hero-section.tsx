"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Globe, Mic, Languages } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-24 lg:py-32">
      <div className="hero-pattern absolute inset-0 opacity-10" />
      <div className="container px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            className="flex flex-col justify-center space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Break Language Barriers with{" "}
                <span className="gradient-text">Real-Time Translation</span>
              </h1>
              <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
                Langlobe creates live debate rooms where speech is transcribed, translated, and
                described in participants' native tongues in real time.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/signup">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/how-it-works">
                  Learn More
                </Link>
              </Button>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
                <span className="ml-2 text-muted-foreground">Real-time Translation</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block h-3 w-3 rounded-full bg-blue-500" />
                <span className="ml-2 text-muted-foreground">100+ Languages</span>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="relative mx-auto flex max-w-[500px] items-center lg:mx-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="relative">
              <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-blue-500/10 backdrop-blur-xl" />
              <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-purple-500/10 backdrop-blur-xl" />
              <div className="glassmorphism relative z-10 rounded-xl p-6 md:p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-6 w-6 text-primary" />
                      <span className="font-medium">Global Debate Room</span>
                    </div>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-xs font-medium text-white">
                      Live
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="relative border-l-2 border-primary/30 pl-4">
                      <div className="absolute -left-1 top-1 h-2 w-2 rounded-full bg-primary" />
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Sarah (English): </span>
                        I believe climate change requires global cooperation.
                      </p>
                    </div>
                    <div className="relative border-l-2 border-primary/30 pl-4">
                      <div className="absolute -left-1 top-1 h-2 w-2 rounded-full bg-primary" />
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Carlos (Spanish): </span>
                        Estoy de acuerdo. Necesitamos políticas que apoyen energías renovables.
                      </p>
                    </div>
                    <div className="relative border-l-2 border-primary/30 pl-4">
                      <div className="absolute -left-1 top-1 h-2 w-2 rounded-full bg-primary" />
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Wei (Chinese): </span>
                        中国已经在大规模投资太阳能和风能技术。
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                      <Mic className="h-4 w-4" />
                      <span className="sr-only">Speak</span>
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                      <MessageCircle className="h-4 w-4" />
                      <span className="sr-only">Chat</span>
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                      <Languages className="h-4 w-4" />
                      <span className="sr-only">Change Language</span>
                    </Button>
                    <span className="ml-auto text-xs text-muted-foreground">Translated in real-time</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
