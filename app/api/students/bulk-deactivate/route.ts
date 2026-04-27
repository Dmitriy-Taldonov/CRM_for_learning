import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { studentIds } = await request.json();

    if (!studentIds || !Array.isArray(studentIds)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    await prisma.user.updateMany({
      where: {
        id: { in: studentIds },
      },
      data: {
        active: false,
      },
    });

    return NextResponse.json({ success: studentIds, failed: [] });
  } catch (error) {
    console.error("Bulk deactivate error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
