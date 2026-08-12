import { Check, CheckCheck, Scissors } from "lucide-react";

/**
 * Static product visual for the hero: a WhatsApp-style conversation that
 * resolves into an appointment landing on the admin agenda. Tells the
 * product story (WhatsApp bot -> real-time schedule) without stock photography.
 */
export function BookingMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[380px] sm:max-w-[420px]">
      <div className="landing-fade-up overflow-hidden rounded-2xl border border-border bg-card shadow-overlay [animation-delay:150ms]">
        <div className="flex items-center gap-2.5 border-b border-border bg-muted/60 px-4 py-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            ET
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">Barbería Estilo RD</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
              en línea · vía WhatsApp
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 px-4 py-5">
          <ChatBubble align="start">Hola! ¿Tienen espacio hoy para corte + barba? 💈</ChatBubble>

          <ChatBubble align="end">
            Claro, Carlos. Hoy tengo estos horarios libres:
            <span className="mt-2 flex flex-wrap gap-1.5">
              <TimeChip>3:00 PM</TimeChip>
              <TimeChip>4:30 PM</TimeChip>
            </span>
          </ChatBubble>

          <ChatBubble align="start">3:00 me funciona 👍</ChatBubble>

          <ChatBubble align="end" status="read">
            Listo. Corte + Barba, hoy 3:00 PM. Te escribo 1h antes para recordarte.
          </ChatBubble>

          <div className="flex items-center gap-1.5 self-start rounded-2xl rounded-bl-sm bg-muted px-3.5 py-2.5">
            <TypingDot delay="0ms" />
            <TypingDot delay="150ms" />
            <TypingDot delay="300ms" />
          </div>
        </div>
      </div>

      <div
        className="landing-pop-in absolute -bottom-6 -left-4 flex w-[230px] items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-overlay [animation-delay:1400ms] sm:-left-10"
        role="status"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Scissors className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">Nueva cita en tu agenda</p>
          <p className="truncate text-sm font-semibold text-foreground">Carlos R. · 3:00 PM</p>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({
  align,
  status,
  children,
}: {
  align: "start" | "end";
  status?: "read";
  children: React.ReactNode;
}) {
  const isEnd = align === "end";
  return (
    <div
      className={
        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed " +
        (isEnd
          ? "self-end rounded-br-sm bg-primary text-primary-foreground"
          : "self-start rounded-bl-sm bg-muted text-foreground")
      }
    >
      {children}
      {status === "read" && (
        <span className="mt-1 flex items-center justify-end gap-1 text-[11px] text-primary-foreground/70">
          <CheckCheck className="h-3 w-3" />
        </span>
      )}
    </div>
  );
}

function TimeChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/15 px-2.5 py-1 text-xs font-medium">
      <Check className="h-3 w-3" />
      {children}
    </span>
  );
}

function TypingDot({ delay }: { delay: string }) {
  return (
    <span
      className="landing-typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground/60"
      style={{ animationDelay: delay }}
      aria-hidden="true"
    />
  );
}
