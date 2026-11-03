"use client";

import { ArrowUpRight, Brain, Key, Phone, Workflow } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickActionsCard() {
  const actions = [
    {
      title: "Voice Agents",
      description: "Build and deploy conversational voice flows with prompt and tool configs.",
      href: "/workflow",
      icon: Workflow,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      title: "Providers & Models",
      description: "Configure LLMs, speech-to-text (STT), and text-to-speech (TTS) engines.",
      href: "/provider-connections",
      icon: Brain,
      color: "text-purple-500 bg-purple-500/10",
    },
    {
      title: "Telephony & Trunks",
      description: "Assign inbound phone numbers and configure SIP trunks with Twilio or custom SIP.",
      href: "/telephony-configurations",
      icon: Phone,
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      title: "API Keys & Developers",
      description: "Generate API credentials to launch calls and integrate Xtel into your apps.",
      href: "/api-keys",
      icon: Key,
      color: "text-amber-500 bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <Link
            key={act.title}
            href={act.href}
            className="group block focus:outline-none"
          >
            <Card className="h-full border-border/60 shadow-sm transition-all duration-200 hover:border-primary/50 hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${act.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                </div>
                <CardTitle className="text-sm font-semibold mt-3 group-hover:text-primary transition-colors">
                  {act.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs leading-relaxed">
                  {act.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

