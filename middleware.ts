import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const loginUrl = new URL("/login", request.url);

    // Ne protège pas la page de login elle-même
    if (request.nextUrl.pathname.startsWith("/login")) {
        return NextResponse.next();
    }

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/users/me`,
        {
            headers: {
                Cookie: request.headers.get("cookie") || "",
            },
        }
    );

    const data = await res.json();

    if (!data.user) {
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next|login|api|favicon.ico|bg-login.jpg).*)"],
};
