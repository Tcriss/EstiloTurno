import { Injectable, Logger } from "@nestjs/common";
import { Business } from "../../../business/domain/entities/business.entity";
import { CreateAppointmentUseCase } from "../../../schedule/application/use-cases/create-appointment.use-case";
import { GetAvailableSlotsUseCase } from "../../../schedule/application/use-cases/get-available-slots.use-case";
import { GetServicesUseCase } from "../../../schedule/application/use-cases/get-services.use-case";
import { minutesToTimeString } from "../../../schedule/domain/services/availability-calculator";
import { HistoryMessage } from "../../domain/entities/chat-session.entity";
import { NluEngine, NluToolDefinition, NluTurn } from "../../domain/ports/nlu-engine";
import { nowDescription, todayDateString } from "./date-utils";

const MAX_TOOL_ITERATIONS = 5;
const MAX_HISTORY_MESSAGES = 20;

const TOOLS: NluToolDefinition[] = [
  {
    name: "check_availability",
    description:
      "Consulta los turnos disponibles para un servicio en una fecha concreta. Úsala SIEMPRE antes de afirmar disponibilidad — nunca inventes horarios.",
    parameters: {
      type: "object",
      properties: {
        date: { type: "string", description: "Fecha a consultar en formato YYYY-MM-DD" },
        service_id: { type: "number", description: "ID del servicio (ver catálogo en el contexto)" },
      },
      required: ["date", "service_id"],
    },
  },
  {
    name: "create_appointment",
    description:
      "Crea la cita definitiva. Úsala SOLO cuando el cliente ya confirmó explícitamente servicio, fecha y hora.",
    parameters: {
      type: "object",
      properties: {
        service_id: { type: "number", description: "ID del servicio" },
        date: { type: "string", description: "Fecha en formato YYYY-MM-DD" },
        time: { type: "string", description: "Hora en formato HH:MM, debe ser un turno disponible" },
      },
      required: ["service_id", "date", "time"],
    },
  },
];

export interface NluConversationResult {
  reply: string;
  history: HistoryMessage[];
}

@Injectable()
export class NluConversationService {
  private readonly logger = new Logger(NluConversationService.name);

  constructor(
    private readonly getServicesUseCase: GetServicesUseCase,
    private readonly getAvailableSlotsUseCase: GetAvailableSlotsUseCase,
    private readonly createAppointmentUseCase: CreateAppointmentUseCase
  ) {}

  async handleMessage(
    engine: NluEngine,
    business: Business,
    phoneNumber: string,
    clientName: string,
    userMessage: string,
    history: HistoryMessage[]
  ): Promise<NluConversationResult> {
    const systemPrompt = await this.buildSystemPrompt(business, clientName);

    const turns: NluTurn[] = [
      ...history.map((message): NluTurn => ({ role: message.role, content: message.content })),
      { role: "user", content: userMessage },
    ];

    let reply: string | null = null;

    for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
      const response = await engine.chat({ systemPrompt, turns, tools: TOOLS });

      if (response.toolCall) {
        const { id, name, arguments: args } = response.toolCall;
        this.logger.log(`NLU tool call [${name}] ${JSON.stringify(args)}`);
        const result = await this.executeTool(business, phoneNumber, clientName, name, args);
        turns.push({ role: "assistant_tool_call", id, name, arguments: args });
        turns.push({ role: "tool_result", toolCallId: id, name, content: result });
        continue;
      }

      reply = response.text;
      break;
    }

    if (!reply) {
      reply =
        "Disculpa, tuve un inconveniente procesando tu solicitud. ¿Puedes repetirme qué servicio necesitas y para qué fecha?";
    }

    const newHistory: HistoryMessage[] = [
      ...history,
      { role: "user", content: userMessage },
      { role: "assistant", content: reply },
    ].slice(-MAX_HISTORY_MESSAGES);

    return { reply, history: newHistory };
  }

  private async buildSystemPrompt(business: Business, clientName: string): Promise<string> {
    const services = await this.getServicesUseCase.execute(business.id);
    const catalog =
      services.length > 0
        ? services
            .map(
              (service) =>
                `- id=${service.id} | ${service.name} | RD$ ${parseFloat(service.price).toLocaleString("es-DO")} | ${service.durationMinutes} min`
            )
            .join("\n")
        : "(este negocio aún no tiene servicios cargados)";

    return [
      `Eres el asistente de citas por WhatsApp de "${business.name}".`,
      `Fecha y hora actual: ${nowDescription()} (hoy es ${todayDateString()}, zona horaria de República Dominicana).`,
      `Horario de atención: de ${minutesToTimeString(business.workStartMinutes)} a ${minutesToTimeString(business.workEndMinutes)}.`,
      `El cliente se llama ${clientName} y escribe desde WhatsApp.`,
      "",
      "Catálogo de servicios (usa estos IDs en las herramientas):",
      catalog,
      "",
      "Reglas:",
      "- Responde SIEMPRE en español, cálido y breve (es WhatsApp: mensajes cortos, sin markdown).",
      "- Tu único objetivo es ayudar a consultar disponibilidad y agendar citas de este negocio. No respondas temas ajenos; redirige con amabilidad.",
      "- Si al cliente le falta especificar el servicio, la fecha o la hora, pregunta SOLO por el dato que falta, de a uno.",
      "- Interpreta fechas coloquiales (\"mañana\", \"el jueves\", \"la semana que viene\") usando la fecha actual de arriba, y confirma la fecha interpretada con el cliente si es ambigua.",
      "- NUNCA afirmes disponibilidad sin consultar check_availability, y NUNCA crees una cita sin confirmación explícita del cliente (servicio + fecha + hora).",
      "- Después de crear la cita, resume: servicio, fecha, hora y precio.",
      "- Si una herramienta devuelve un error (ej. horario recién tomado), explícalo y ofrece alternativas.",
    ].join("\n");
  }

  private async executeTool(
    business: Business,
    phoneNumber: string,
    clientName: string,
    toolName: string,
    args: Record<string, unknown>
  ): Promise<string> {
    try {
      switch (toolName) {
        case "check_availability": {
          const date = String(args.date ?? "");
          const serviceId = Number(args.service_id);
          if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isInteger(serviceId)) {
            return JSON.stringify({ error: "Parámetros inválidos: se requiere date (YYYY-MM-DD) y service_id numérico." });
          }
          const slots = await this.getAvailableSlotsUseCase.execute(business.id, date, serviceId);
          return JSON.stringify({ date, serviceId, availableSlots: slots });
        }

        case "create_appointment": {
          const date = String(args.date ?? "");
          const time = String(args.time ?? "");
          const serviceId = Number(args.service_id);
          if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time) || !Number.isInteger(serviceId)) {
            return JSON.stringify({ error: "Parámetros inválidos: se requiere service_id, date (YYYY-MM-DD) y time (HH:MM)." });
          }
          const appointment = await this.createAppointmentUseCase.execute({
            businessId: business.id,
            phoneNumber,
            clientName,
            serviceId,
            date,
            time,
          });
          return JSON.stringify({ ok: true, appointmentId: appointment.id, date, time });
        }

        default:
          return JSON.stringify({ error: `Herramienta desconocida: ${toolName}` });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error inesperado ejecutando la herramienta.";
      this.logger.warn(`NLU tool [${toolName}] falló: ${message}`);
      return JSON.stringify({ error: message });
    }
  }
}
