import { Badge } from "@/components/ui/badge";
import { APPOINTMENT_STATUS_BADGE_VARIANT, APPOINTMENT_STATUS_LABEL } from "@/lib/appointment-status";
import type { AppointmentStatus } from "@/services/appointments.service";

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return <Badge variant={APPOINTMENT_STATUS_BADGE_VARIANT[status]}>{APPOINTMENT_STATUS_LABEL[status]}</Badge>;
}
