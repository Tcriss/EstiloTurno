"use client";

import { useEffect } from "react";
import { sileo } from "sileo";

type AuthNotificationOptions = {
  error?: string;
  success?: string;
};

export function useAuthNotifications({ error, success }: AuthNotificationOptions) {
  useEffect(() => {
    if (!error) return;

    sileo.error({
      title: "No pudimos completar la acción",
      description: error,
      fill: "#ba1a1a",
    });
  }, [error]);

  useEffect(() => {
    if (!success) return;

    sileo.success({
      title: "Proceso completado",
      description: success,
      fill: "#006a66",
    });
  }, [success]);
}