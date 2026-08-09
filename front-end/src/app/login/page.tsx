import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginCallbackNotice } from "@/components/auth/LoginCallbackNotice";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout mode="login">
      <Suspense>
        <LoginCallbackNotice />
      </Suspense>
      <LoginForm />
    </AuthLayout>
  );
}
