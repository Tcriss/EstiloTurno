"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

export function WelcomeHeader() {
  const [greeting, setGreeting] = useState("Bienvenido");
  const [firstName, setFirstName] = useState("");
  const [dateLabel, setDateLabel] = useState("");

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();

    if (hour < 12) setGreeting("Buenos días");
    else if (hour < 18) setGreeting("Buenas tardes");
    else setGreeting("Buenas noches");

    setDateLabel(
      now.toLocaleDateString("es-DO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    );

    const supabase = getSupabaseClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      const user = data?.user;
      if (!user) return;
      const fullName: string = user.user_metadata?.full_name ?? "";
      const first = fullName.trim().split(" ")[0];
      if (first) setFirstName(first);
    });
  }, []);

  return (
    <div className="mb-6">
      <h1 className="font-geist text-2xl font-bold text-[#0F172A]">
        {greeting}{firstName ? `, ${firstName}` : ""} 👋
      </h1>
      <p className="mt-1 capitalize text-sm text-[#718096]">{dateLabel}</p>
    </div>
  );
}
