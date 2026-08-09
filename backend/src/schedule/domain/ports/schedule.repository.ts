import { Appointment, AppointmentStatus, AppointmentWithDetails } from "../entities/appointment.entity";
import { Service } from "../entities/service.entity";

export const SCHEDULE_REPOSITORY = Symbol("SCHEDULE_REPOSITORY");

export interface BookedRange {
  start: number;
  end: number;
}

export interface CreateAppointmentInput {
  businessId: number;
  phoneNumber: string;
  clientName: string;
  serviceId: number;
  date: string;
  time: string;
  durationMinutes: number;
}

export interface ListAppointmentsFilters {
  date?: string;
  status?: AppointmentStatus;
}

export interface UpdateAppointmentInput {
  date?: string;
  time?: string;
  status?: AppointmentStatus;
}

export interface CreateServiceInput {
  businessId: number;
  name: string;
  price: string;
  durationMinutes: number;
}

export interface UpdateServiceInput {
  name?: string;
  price?: string;
  durationMinutes?: number;
}

export interface ScheduleRepository {
  findAllServices(businessId: number): Promise<Service[]>;
  findServiceById(businessId: number, id: number): Promise<Service | null>;
  createService(input: CreateServiceInput): Promise<Service>;
  updateService(businessId: number, id: number, input: UpdateServiceInput): Promise<Service | null>;
  deleteService(businessId: number, id: number): Promise<boolean>;

  findBookedRanges(businessId: number, date: string, excludeAppointmentId?: number): Promise<BookedRange[]>;
  upsertClient(id: string, name: string): Promise<void>;
  /**
   * Inserta la cita dentro de una transacción que re-verifica el solapamiento —
   * lanza ConflictException si otro cliente tomó el slot entre el chequeo y el insert.
   */
  createAppointment(input: CreateAppointmentInput): Promise<Appointment>;

  listAppointments(businessId: number, filters: ListAppointmentsFilters): Promise<AppointmentWithDetails[]>;
  findAppointmentById(businessId: number, id: number): Promise<AppointmentWithDetails | null>;
  updateAppointment(businessId: number, id: number, input: UpdateAppointmentInput): Promise<Appointment | null>;
}
