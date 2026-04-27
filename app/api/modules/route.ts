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
    const moduleCount = await prisma.module.count({ where: { courseId: body.courseId } });
    
    const module = await prisma.module.create({
      data: {
        courseId: body.courseId,
        title: body.title || "New Module",
        order: body.order ?? (moduleCount + 1),
      },
    });
    return NextResponse.json(module);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
