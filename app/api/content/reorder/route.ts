import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(request: Request) {
  const session = await getSession();
  if (session?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { contents } = await request.json(); // Array of { id: string, order: number }

    await prisma.$transaction(
      contents.map((content: { id: string; order: number }) =>
        prisma.lessonContent.update({
          where: { id: content.id },
          data: { order: content.order },
        })
      )
    );

    return NextResponse.json({ message: "Positions updated" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
