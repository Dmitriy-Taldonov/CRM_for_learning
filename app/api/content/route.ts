import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (session?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const contentCount = await prisma.lessonContent.count({ where: { lessonId: body.lessonId } });
    const content = await prisma.lessonContent.create({
      data: {
        lessonId: body.lessonId,
        type: body.type,
        content: body.content || {},
        order: body.order ?? (contentCount + 1),
      },
    });
    return NextResponse.json(content);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
