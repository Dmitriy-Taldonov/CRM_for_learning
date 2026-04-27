import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      settings: true,
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              contents: {
                orderBy: { order: "asc" },
              },
            },
          },
          quizzes: {
            orderBy: { order: "asc" },
            include: {
              questions: {
                orderBy: { order: "asc" },
                include: {
                  options: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  return NextResponse.json(course);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (session?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const course = await prisma.course.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        thumbnailUrl: body.thumbnailUrl,
        published: body.published,
      },
    });

    if (body.settings) {
      await prisma.courseSettings.upsert({
        where: { courseId: id },
        update: {
          require100Percent: body.settings.require100Percent,
          generateCertificate: body.settings.generateCertificate,
          includeTestResults: body.settings.includeTestResults,
          enableReporting: body.settings.enableReporting
        },
        create: {
          courseId: id,
          require100Percent: body.settings.require100Percent ?? false,
          generateCertificate: body.settings.generateCertificate ?? false,
          includeTestResults: body.settings.includeTestResults ?? false,
          enableReporting: body.settings.enableReporting ?? true
        }
      });
    }

    return NextResponse.json(course);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (session?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ message: "Course deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
