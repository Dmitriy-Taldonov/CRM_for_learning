import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(request: Request) {
  const session = await getSession();
  if (session?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { modules } = await request.json(); // Array of { id: string, order: number }

    await prisma.$transaction(
      modules.map((module: { id: string; order: number }) =>
        prisma.module.update({
          where: { id: module.id },
          data: { order: module.order },
        })
      )
    );

    return NextResponse.json({ message: "Positions updated" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
