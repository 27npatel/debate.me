"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Langlobe has revolutionized our international meetings. We can now have seamless conversations with partners across four different countries.",
    author: "Sarah Johnson",
    role: "Global Marketing Director",
    avatar: "/avatars/sarah.png",
    initials: "SJ",
  },
  {
    quote:
      "As a language teacher, I've found Langlobe to be an incredible tool for my students to practice with native speakers without the usual communication barriers.",
    author: "Carlos Mendez",
    role: "Spanish Language Professor",
    avatar: "/avatars/carlos.png",
    initials: "CM",
  },
  {
    quote:
      "The real-time translation is incredibly accurate. I've built connections with people I would never have been able to communicate with otherwise.",
    author: "Wei Zhang",
    role: "Tech Entrepreneur",
    avatar: "/avatars/wei.png",
    initials: "WZ",
  },
];

export function TestimonialSection({ id }: { id?: string }) {
  return (
    <section id={id} className="bg-background py-20 md:py-24 lg:py-28">
      <div className="container px-4 md:px-6">
        <motion.div
          className="mx-auto mb-12 max-w-[58rem] text-center md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Don't Just Take Our Word For It
          </h2>
          <p className="text-lg text-muted-foreground">
            Hear from users who are breaking language barriers and building global connections.
          </p>
        </motion.div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <Quote className="mb-4 h-8 w-8 text-primary/60" />
                  <p className="mb-6 text-lg">{testimonial.quote}</p>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{testimonial.author}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
