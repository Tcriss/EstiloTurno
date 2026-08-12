"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCalendarStatus, useDisconnectGoogleCalendar } from "@/hooks/use-calendar";
import { clientFetch } from "@/lib/api-client";
import type { CalendarConnectionStatus } from "@/services/calendar.service";

type GoogleCalendarCardProps = {
  initialStatus: CalendarConnectionStatus;
};

export function GoogleCalendarCard({ initialStatus }: GoogleCalendarCardProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { data: status } = useCalendarStatus();
  const disconnect = useDisconnectGoogleCalendar();

  const connected = (status ?? initialStatus).connected;

  async function handleConnect() {
    setIsConnecting(true);
    try {
      const data = await clientFetch<{ authUrl: string }>("/api/backoffice/calendar/google/connect");
      window.location.href = data.authUrl;
    } catch (error) {
      toast.error("No pudimos iniciar la conexión con Google Calendar", {
        description: error instanceof Error ? error.message : undefined,
      });
      setIsConnecting(false);
    }
  }

  async function handleDisconnect() {
    try {
      await disconnect.mutateAsync();
      toast.success("Google Calendar desconectado");
    } catch (error) {
      toast.error("No pudimos desconectar Google Calendar", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
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
        <Badge variant={connected ? "default" : "outline"}>{connected ? "Conectado" : "No conectado"}</Badge>
        {connected ? (
          <Button variant="outline" disabled={disconnect.isPending} onClick={handleDisconnect}>
            {disconnect.isPending ? "Desconectando..." : "Desconectar"}
          </Button>
        ) : (
          <Button variant="outline" disabled={isConnecting} onClick={handleConnect}>
            {isConnecting ? "Conectando..." : "Conectar con Google Calendar"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
