"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTASection() {
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
            <Button variant="outline" size="lg" asChild className="border-white text-white hover:bg-white/10">
              <Link href="/demo">
                See Demo
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
