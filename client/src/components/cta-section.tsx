"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

export function CTASection() {
  const [showDemo, setShowDemo] = useState(false);
  return (
    <section className="gradient-bg relative py-20 md:py-24 lg:py-28">
      <div className="absolute inset-0 bg-grid-white/10 bg-[length:20px_20px] opacity-10" />
      <div className="container relative px-4 md:px-6">
        <motion.div
          className="mx-auto max-w-[64rem] text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Start Breaking Language Barriers Today
          </h2>
          <p className="mb-8 text-lg text-white/80 md:text-xl">
            Join thousands of users connecting across languages and cultures. Sign up now and experience the power of real-time translation in global conversations.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="bg-white text-primary hover:bg-white/90">
              <Link href="/signup" className="flex items-center">
                Get Started for Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              type="button"
              className="border-white bg-white/20 text-blue-900 hover:bg-white/40 hover:text-blue-800 transition-colors"
              onClick={() => setShowDemo(true)}
            >
              See Demo
            </Button>
          </div>
        </motion.div>
        {showDemo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full p-4">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
                onClick={() => setShowDemo(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <div className="aspect-w-16 aspect-h-9 w-full">
                <iframe
                  src="https://www.loom.com/embed/4e15853c19314fb2812a110adaaa4385"
                  frameBorder="0"
                  allowFullScreen
                  className="w-full h-96 rounded-lg"
                  title="Demo Video"
                ></iframe>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
