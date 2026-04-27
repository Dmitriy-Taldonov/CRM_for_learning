import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (session?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const lessonCount = await prisma.lesson.count({ where: { moduleId: body.moduleId } });
    const lesson = await prisma.lesson.create({
      data: {
        moduleId: body.moduleId,
        title: body.title || "New Lesson",
        order: body.order ?? (lessonCount + 1),
      },
    });
    return NextResponse.json(lesson);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
