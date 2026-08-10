import { cache } from "react";
import { apiFetch } from "@/lib/api-server";
import type { SafeUser } from "@/services/auth.service";

// cache() dedupea la llamada a /auth/me entre el layout y las páginas dentro del mismo request.
export const getCurrentUser = cache(() => apiFetch<SafeUser>("/auth/me"));
