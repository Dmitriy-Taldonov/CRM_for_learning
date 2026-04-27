import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, login } from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!user.password) {
      return NextResponse.json({ error: "Please log in with Google" }, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await login({ id: user.id, email: user.email, role: user.role, status: user.status });

    return NextResponse.json({
      user: { id: user.id, email: user.email, role: user.role, status: user.status },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 400 });
  }
}
