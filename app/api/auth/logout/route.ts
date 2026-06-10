import { NextRequest, NextResponse } from "next/server";
import { sessionCookieOptions } from "@/lib/session";

export async function POST(request: NextRequest) {
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "127.0.0.1:3000";
  const response = NextResponse.redirect(new URL("/", `${proto}://${host}`), 303);
  response.cookies.delete(sessionCookieOptions().name);
  return response;
}
