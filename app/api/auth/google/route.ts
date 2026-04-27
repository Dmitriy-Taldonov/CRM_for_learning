import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { login } from "@/lib/auth";
import { OAuth2Client } from "google-auth-library";
import { UserStatus } from "@prisma/client";

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(request: Request) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json({ error: "Missing Google credential" }, { status: 400 });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json({ error: "Invalid Google token payload" }, { status: 400 });
    }

    const { email, name, sub: googleId, picture: avatarUrl } = payload;

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Auto-approve logic
      let status: UserStatus = "PENDING";
      if (email.endsWith("@company.com")) {
        status = "ACTIVE";
      }

      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split("@")[0],
          googleId,
          avatarUrl,
          role: "STUDENT",
          status,
        },
      });
    } else if (!user.googleId) {
      // Link Google ID if email exists but no googleId
      user = await prisma.user.update({
        where: { email },
        data: { googleId, avatarUrl: user.avatarUrl || avatarUrl }
      });
    }

    await login({ id: user.id, email: user.email, role: user.role, status: user.status });

    return NextResponse.json({
      user: { id: user.id, email: user.email, role: user.role, status: user.status },
    });
  } catch (error: any) {
    console.error("Google Auth Error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 400 });
  }
}
