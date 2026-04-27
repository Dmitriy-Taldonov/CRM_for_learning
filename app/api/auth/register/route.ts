import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UserStatus } from "@prisma/client";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    let status: UserStatus = "PENDING";
    if (email.endsWith("@company.com")) {
      status = "ACTIVE";
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: email.split("@")[0],
        role: "STUDENT",
        status
      },
    });

    return NextResponse.json({
      user: { id: user.id, email: user.email, role: user.role, status: user.status },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 400 });
  }
}
