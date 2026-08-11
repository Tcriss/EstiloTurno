"use client";

import { useEffect, useState } from "react";

export function WelcomeHeader({ firstName = "" }: { firstName?: string }) {
  const [greeting, setGreeting] = useState("Bienvenido");
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
  }, []);

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
        {greeting}
        {firstName ? `, ${firstName}` : ""}
      </h1>
      <p className="mt-1 text-sm capitalize text-muted-foreground">{dateLabel}</p>
    </div>
  );
}
