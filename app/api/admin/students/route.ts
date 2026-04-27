import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (session?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        status: true,
        active: true,
        createdAt: true,
        lastLoginAt: true,
        enrollments: {
          include: {
            course: {
              include: {
                _count: {
                  select: {
                    modules: true
                  }
                },
                modules: {
                  include: {
                    _count: {
                      select: {
                        lessons: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        progress: {
          where: { completed: true },
          select: { lessonId: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(students);
  } catch {
    // Fallback if some columns don't exist yet
    try {
      const students = await prisma.user.findMany({
        where: { role: "STUDENT" },
        select: {
          id: true,
          email: true,
          enrollments: {
            include: {
              course: {
                select: { id: true, title: true }
              }
            }
          }
        }
      });
      return NextResponse.json(students.map(s => ({ ...s, active: true, createdAt: new Date() })));
    } catch (e) {
      console.error("Students fetch error:", e);
      return NextResponse.json([]);
    }
  }
}

export async function DELETE(request: Request) {
    const session = await getSession();
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
  
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
