"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Stub de UI: el backend todavía no implementa la integración con Google Calendar
// (ver roadmap en docs/PRODUCTION.md sección 5). Cuando se implemente, esto necesita:
// - Columnas googleRefreshToken/googleCalendarId en `businesses`.
// - Flujo OAuth: GET /backoffice/business/google/connect y /google/callback.
// - Sincronizar CreateAppointmentUseCase/UpdateAppointmentUseCase con el nuevo puerto.
export function GoogleCalendarCard() {
  const [isConnecting, setIsConnecting] = useState(false);

  async function handleConnect() {
    setIsConnecting(true);
    const response = await fetch("/api/integrations/google-calendar/connect", { method: "POST" });
    setIsConnecting(false);

    const data = await response.json().catch(() => null);
    toast.info(data?.message ?? "Integración disponible próximamente");
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-primary" aria-hidden="true" />
          Google Calendar
        </CardTitle>
        <CardDescription>Sincronizá los turnos confirmados con tu Google Calendar.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <Badge variant="outline">No conectado</Badge>
        <Button variant="outline" disabled={isConnecting} onClick={handleConnect}>
          {isConnecting ? "Conectando..." : "Conectar con Google Calendar"}
        </Button>
      </CardContent>
    </Card>
  );
}
