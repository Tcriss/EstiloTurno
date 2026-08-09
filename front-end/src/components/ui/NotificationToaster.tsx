"use client";

import { Toaster } from "sileo";

export function NotificationToaster() {
  return (
    <Toaster
      position="top-right"
      offset={{ top: 20, right: 20 }}
      theme="light"
      options={{ duration: 5000, roundness: 12 }}
    />
  );
}