import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  
  try {
    const where = session?.role === "ADMIN" ? {} : { published: true };
    const courses = await prisma.course.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(courses);
  } catch {
    // Fallback: if published column doesn't exist yet, fetch all for admin
    try {
      const courses = await prisma.course.findMany({
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(courses);
    } catch {
      return NextResponse.json([]);
    }
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (session?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const course = await prisma.course.create({
      data: {
        title: body.title || "Untitled Course",
        description: body.description || "",
        thumbnailUrl: body.thumbnailUrl || "",
      },
    });
    return NextResponse.json(course);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
