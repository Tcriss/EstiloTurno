"use server";

import { redirect } from "next/navigation";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { clearAuthCookies, getRefreshToken, setAuthCookies } from "@/lib/cookies";
import * as authService from "@/services/auth.service";

export type AuthActionResult = { success: true } | { success: false; error: string };

export async function loginAction(values: { email: string; password: string }): Promise<AuthActionResult> {
  try {
    const result = await authService.login(values.email.trim(), values.password);
    await setAuthCookies(result.accessToken, result.refreshToken);
  } catch (error) {
    return { success: false, error: getAuthErrorMessage(error, "login") };
  }

  redirect("/dashboard");
}

export async function registerAction(values: {
  businessName: string;
  fullName: string;
  email: string;
  password: string;
}): Promise<AuthActionResult> {
  try {
    const result = await authService.register({
      businessName: values.businessName.trim(),
      name: values.fullName.trim(),
      email: values.email.trim(),
      password: values.password,
    });
    await setAuthCookies(result.accessToken, result.refreshToken);
  } catch (error) {
    return { success: false, error: getAuthErrorMessage(error, "register") };
  }

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  const refreshToken = await getRefreshToken();

  if (refreshToken) {
    await authService.logout(refreshToken).catch(() => undefined);
  }

  await clearAuthCookies();
  redirect("/login");
}

export async function forgotPasswordAction(email: string): Promise<AuthActionResult> {
  try {
    await authService.forgotPassword(email.trim());
  } catch (error) {
    return { success: false, error: getAuthErrorMessage(error, "passwordReset") };
  }

  return { success: true };
}

export async function resetPasswordAction(token: string, newPassword: string): Promise<AuthActionResult> {
  try {
    await authService.resetPassword(token, newPassword);
  } catch (error) {
    return { success: false, error: getAuthErrorMessage(error, "passwordReset") };
  }

  return { success: true };
}
