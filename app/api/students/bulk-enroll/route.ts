import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { studentIds, courseId } = await request.json();

    if (!studentIds || !Array.isArray(studentIds) || !courseId) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const results = await Promise.allSettled(
      studentIds.map((userId) =>
        prisma.enrollment.upsert({
          where: {
            userId_courseId: {
              userId,
              courseId,
            },
          },
          update: {},
          create: {
            userId,
            courseId,
          },
        })
      )
    );

    const success = studentIds.filter((_, i) => results[i].status === "fulfilled");
    const failed = studentIds.filter((_, i) => results[i].status === "rejected");

    return NextResponse.json({ success, failed });
  } catch (error) {
    console.error("Bulk enroll error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
