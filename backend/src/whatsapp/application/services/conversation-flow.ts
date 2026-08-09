import { CreateAppointmentUseCase } from "../../../schedule/application/use-cases/create-appointment.use-case";
import { GetAvailableSlotsUseCase } from "../../../schedule/application/use-cases/get-available-slots.use-case";
import { GetServicesUseCase } from "../../../schedule/application/use-cases/get-services.use-case";
import { ChatState, SessionMetadata } from "../../domain/entities/chat-session.entity";
import { todayDateString, tomorrowDateString } from "./date-utils";

export interface HandlerResult {
  nextState: ChatState;
  responseMessage: string;
  updatedMetadata: SessionMetadata;
}

export interface ScheduleUseCases {
  getServices: GetServicesUseCase;
  getAvailableSlots: GetAvailableSlotsUseCase;
  createAppointment: CreateAppointmentUseCase;
}

export function parseDateInput(input: string): string | null {
  const normalized = input.toLowerCase().trim();
  const todayStr = todayDateString();

  if (normalized === "hoy") {
    return todayStr;
  }
  if (normalized === "mañana" || normalized === "manana") {
    return tomorrowDateString();
  }

  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (regex.test(normalized)) {
    const parts = normalized.split("-");
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const testDate = new Date(y, m, d);
    if (testDate.getFullYear() === y && testDate.getMonth() === m && testDate.getDate() === d) {
      if (normalized >= todayStr) {
        return normalized;
      }
    }
  }
  return null;
}

export async function handleChatState(
  businessId: number,
  state: ChatState,
  messageBody: string,
  metadata: SessionMetadata,
  clientName: string,
  phoneNumber: string,
  scheduleUseCases: ScheduleUseCases
): Promise<HandlerResult> {
  const text = messageBody.trim();

  switch (state) {
    case ChatState.START: {
      const services = await scheduleUseCases.getServices.execute(businessId);
      let responseMessage = `¡Hola ${clientName}! Te damos la bienvenida 💇‍♀️✨\n\nPor favor, selecciona el servicio que deseas agendar ingresando el número correspondiente:\n\n`;

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
      const services = await scheduleUseCases.getServices.execute(businessId);
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

      const responseMessage = `Has seleccionado: *${selectedService.name}* (RD$ ${parseFloat(selectedService.price).toLocaleString("es-DO")}).\n\nPor favor, indica la fecha para tu cita en formato *AAAA-MM-DD*, o escribe *Hoy* o *Mañana*.`;

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
          responseMessage: "⚠️ Fecha no válida o en el pasado. Por favor ingresa una fecha futura en formato *AAAA-MM-DD*, o escribe *Hoy* o *Mañana*.",
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

      const slots = await scheduleUseCases.getAvailableSlots.execute(businessId, parsedDate, metadata.serviceId);

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
        clientName: metadata.clientName || clientName,
        // Guardamos los slots ofrecidos para mapear la respuesta numérica del próximo paso
        tempSlots: slots,
      };

      return {
        nextState: ChatState.SELECTING_TIME,
        responseMessage,
        updatedMetadata,
      };
    }

    case ChatState.SELECTING_TIME: {
      const tempSlots = metadata.tempSlots || [];
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
      delete updatedMetadata.tempSlots;

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
        await scheduleUseCases.createAppointment.execute({
          businessId,
          phoneNumber,
          clientName: nameToUse,
          serviceId: metadata.serviceId,
          date: metadata.date,
          time: metadata.time,
        });

        const responseMessage = `¡Cita agendada con éxito! 🎉\n\nTe esperamos el *${metadata.date}* a las *${metadata.time}*.\n¡Gracias por preferirnos!`;

        return {
          nextState: ChatState.START,
          responseMessage,
          updatedMetadata: {},
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
