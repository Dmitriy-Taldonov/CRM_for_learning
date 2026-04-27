import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (session?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, courseId } = body;

    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId }
    });

    return NextResponse.json(enrollment);
  } catch (error: any) {
    return NextResponse.json({ error: "Already enrolled or invalid data" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (session?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const courseId = searchParams.get("courseId");

  if (!userId || !courseId) {
    return NextResponse.json({ error: "userId and courseId required" }, { status: 400 });
  }

  await prisma.enrollment.delete({
    where: {
      userId_courseId: { userId, courseId }
    }
  });

  return NextResponse.json({ success: true });
}
