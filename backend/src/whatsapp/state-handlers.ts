import { ChatState, SessionMetadata } from "./types";
import { ScheduleService } from "../schedule/schedule.service";

export interface HandlerResult {
  nextState: ChatState;
  responseMessage: string;
  updatedMetadata: SessionMetadata;
}

export function parseDateInput(input: string): string | null {
  const normalized = input.toLowerCase().trim();
  // El tiempo actual local del sistema es 2026-06-21
  const today = new Date(2026, 5, 21); // Mes 5 es Junio

  if (normalized === "hoy") {
    return formatDateString(today);
  }
  if (normalized === "mañana" || normalized === "manana") {
    const tomorrow = new Date(2026, 5, 22);
    return formatDateString(tomorrow);
  }

  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (regex.test(normalized)) {
    const parts = normalized.split("-");
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const testDate = new Date(y, m, d);
    if (testDate.getFullYear() === y && testDate.getMonth() === m && testDate.getDate() === d) {
      const todayStr = formatDateString(today);
      if (normalized >= todayStr) {
        return normalized;
      }
    }
  }
  return null;
}

function formatDateString(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function handleChatState(
  state: ChatState,
  messageBody: string,
  metadata: SessionMetadata,
  clientName: string,
  phoneNumber: string,
  scheduleService: ScheduleService
): Promise<HandlerResult> {
  const text = messageBody.trim();

  switch (state) {
    case ChatState.START: {
      const services = await scheduleService.getServices();
      let responseMessage = `¡Hola ${clientName}! Te damos la bienvenida a *EstiloTurno* 💇‍♀️✨\n\nPor favor, selecciona el servicio que deseas agendar ingresando el número correspondiente:\n\n`;

      services.forEach((service, index) => {
        responseMessage += `*${index + 1}.* ${service.name} — RD$ ${parseFloat(service.price).toLocaleString("es-DO")} (${service.durationMinutes} min)\n`;
      });

      return {
        nextState: ChatState.SELECTING_SERVICE,
        responseMessage,
        updatedMetadata: { clientName },
      };
    }

    case ChatState.SELECTING_SERVICE: {
      const services = await scheduleService.getServices();
      const optionIndex = parseInt(text, 10) - 1;

      if (isNaN(optionIndex) || optionIndex < 0 || optionIndex >= services.length) {
        let responseMessage = "⚠️ Opción inválida. Por favor, selecciona un número de la lista:\n\n";
        services.forEach((service, index) => {
          responseMessage += `*${index + 1}.* ${service.name} — RD$ ${parseFloat(service.price).toLocaleString("es-DO")} (${service.durationMinutes} min)\n`;
        });
        return {
          nextState: ChatState.SELECTING_SERVICE,
          responseMessage,
          updatedMetadata: metadata,
        };
      }

      const selectedService = services[optionIndex];
      const updatedMetadata: SessionMetadata = {
        ...metadata,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        price: selectedService.price,
      };

      const responseMessage = `Has seleccionado: *${selectedService.name}* (RD$ ${parseFloat(selectedService.price).toLocaleString("es-DO")}).\n\nPor favor, indica la fecha para tu cita en formato *AAAA-MM-DD* (ejemplo: 2026-06-25), o escribe *Hoy* o *Mañana*.`;

      return {
        nextState: ChatState.SELECTING_DATE,
        responseMessage,
        updatedMetadata,
      };
    }

    case ChatState.SELECTING_DATE: {
      const parsedDate = parseDateInput(text);
      if (!parsedDate) {
        return {
          nextState: ChatState.SELECTING_DATE,
          responseMessage: "⚠️ Fecha no válida o en el pasado. Por favor ingresa una fecha futura en formato *AAAA-MM-DD* (ejemplo: 2026-06-25), o escribe *Hoy* o *Mañana*.",
          updatedMetadata: metadata,
        };
      }

      if (!metadata.serviceId) {
        return {
          nextState: ChatState.START,
          responseMessage: "Hubo un error de sesión. Empecemos de nuevo. Escribe 'Hola' para iniciar.",
          updatedMetadata: {},
        };
      }

      const slots = await scheduleService.getAvailableSlots(parsedDate, metadata.serviceId);

      if (slots.length === 0) {
        return {
          nextState: ChatState.SELECTING_DATE,
          responseMessage: `😔 Lo sentimos, no hay turnos disponibles para la fecha *${parsedDate}*. Por favor, intenta con otra fecha (AAAA-MM-DD):`,
          updatedMetadata: metadata,
        };
      }

      let responseMessage = `Para el día *${parsedDate}*, tenemos los siguientes turnos disponibles. Por favor responde con el número de la opción que prefieras:\n\n`;
      slots.forEach((slot, index) => {
        responseMessage += `*${index + 1}.* ${slot}\n`;
      });

      const updatedMetadata: SessionMetadata = {
        ...metadata,
        date: parsedDate,
        // Guardamos los slots en la metadata de sesión temporal para poder mapear la respuesta del usuario en el próximo paso
        clientName: metadata.clientName || clientName,
      };

      // Guardamos de forma especial el mapeo de slots en la metadata
      (updatedMetadata as any).tempSlots = slots;

      return {
        nextState: ChatState.SELECTING_TIME,
        responseMessage,
        updatedMetadata,
      };
    }

    case ChatState.SELECTING_TIME: {
      const tempSlots: string[] = (metadata as any).tempSlots || [];
      const optionIndex = parseInt(text, 10) - 1;

      if (isNaN(optionIndex) || optionIndex < 0 || optionIndex >= tempSlots.length) {
        let responseMessage = "⚠️ Opción inválida. Por favor selecciona un número de la lista de turnos disponibles:\n\n";
        tempSlots.forEach((slot, index) => {
          responseMessage += `*${index + 1}.* ${slot}\n`;
        });
        return {
          nextState: ChatState.SELECTING_TIME,
          responseMessage,
          updatedMetadata: metadata,
        };
      }

      const selectedTime = tempSlots[optionIndex];
      const updatedMetadata: SessionMetadata = {
        ...metadata,
        time: selectedTime,
      };
      // Limpiamos los slots temporales para mantener la metadata limpia
      delete (updatedMetadata as any).tempSlots;

      const formattedPrice = parseFloat(metadata.price || "0").toLocaleString("es-DO");
      const responseMessage = `¡Excelente! Aquí tienes el resumen de tu cita:\n\n💇‍♀️ *Servicio:* ${metadata.serviceName}\n💰 *Costo:* RD$ ${formattedPrice}\n📅 *Fecha:* ${metadata.date}\n⏰ *Hora:* ${selectedTime}\n\nPor favor, confirma tu cita respondiendo:\n*1.* Para Confirmar\n*2.* Para Cancelar y Empezar de nuevo`;

      return {
        nextState: ChatState.CONFIRMING,
        responseMessage,
        updatedMetadata,
      };
    }

    case ChatState.CONFIRMING: {
      if (text === "1") {
        if (!metadata.serviceId || !metadata.date || !metadata.time) {
          return {
            nextState: ChatState.START,
            responseMessage: "Hubo un error al procesar tu cita. Por favor inicia nuevamente escribiendo 'Hola'.",
            updatedMetadata: {},
          };
        }

        const nameToUse = metadata.clientName || clientName;
        await scheduleService.createAppointment(
          phoneNumber,
          nameToUse,
          metadata.serviceId,
          metadata.date,
          metadata.time
        );

        const responseMessage = `¡Cita agendada con éxito! 🎉\n\nTe esperamos el *${metadata.date}* a las *${metadata.time}*.\n¡Gracias por elegir EstiloTurno!`;

        return {
          nextState: ChatState.START,
          responseMessage,
          updatedMetadata: {}, // Limpiamos la sesión al confirmar
        };
      } else if (text === "2") {
        return {
          nextState: ChatState.START,
          responseMessage: "Has cancelado el proceso. Escribe 'Hola' cuando desees agendar una nueva cita.",
          updatedMetadata: {},
        };
      } else {
        return {
          nextState: ChatState.CONFIRMING,
          responseMessage: "⚠️ Opción inválida. Responde:\n*1.* Para Confirmar la cita\n*2.* Para Cancelar y Empezar de nuevo",
          updatedMetadata: metadata,
        };
      }
    }

    default: {
      return {
        nextState: ChatState.START,
        responseMessage: "Hola, para iniciar el proceso de agendamiento escribe 'Hola' o cualquier otro mensaje.",
        updatedMetadata: {},
      };
    }
  }
}
