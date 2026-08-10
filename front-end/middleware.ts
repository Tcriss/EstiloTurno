import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth-cookie-names";

export function middleware(request: NextRequest) {
  const hasAccessToken = Boolean(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value);

  if (!hasAccessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
