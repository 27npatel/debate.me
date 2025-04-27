"use client";

import { motion } from "framer-motion";
import { Mic, Languages, Globe, Users, PenTool, Video } from "lucide-react";

const features = [
  {
    title: "Real-time Translation",
    description:
      "Instantly translate conversations across multiple languages, allowing seamless communication between participants.",
    icon: Languages,
  },
  {
    title: "Speech-to-Text Transcription",
    description:
      "Speak naturally in your language and have your words accurately transcribed for others to read in their preferred language.",
    icon: Mic,
  },
  {
    title: "Global Debate Rooms",
    description:
      "Join topic-specific debate rooms with participants from around the world to discuss ideas and share perspectives.",
    icon: Globe,
  },
  {
    title: "Friend Connections",
    description:
      "Connect with other users to build a network of global contacts for future discussions and debates.",
    icon: Users,
  },
  {
    title: "Customizable Profiles",
    description:
      "Create a personalized profile with your language preferences, interests, and expertise to find relevant discussions.",
    icon: PenTool,
  },
  {
    title: "Video Integration",
    description:
      "Enable video to enhance the debate experience with non-verbal communication while maintaining language translation.",
    icon: Video,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-muted/30 py-20 md:py-24 lg:py-28">
      <div className="container px-4 md:px-6">
        <div className="mx-auto mb-16 max-w-[58rem] text-center">
          <motion.h2
            className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Powerful Features for Cross-Cultural Communication
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Our platform combines cutting-edge technologies to make global conversations effortless and meaningful.
          </motion.p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="relative overflow-hidden rounded-xl border bg-background p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
