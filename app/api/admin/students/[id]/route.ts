import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (session?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        department: true,
        enrollments: {
          include: {
            course: {
              include: {
                modules: {
                  include: {
                    lessons: true
                  }
                }
              }
            }
          }
        },
        progress: true,
        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 10
        },
        learningSessions: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Process data
    const courses = user.enrollments.map((en: any) => {
      const courseLessons = en.course.modules.flatMap((m: any) => m.lessons.map((l: any) => l.id));
      const totalLessons = courseLessons.length;
      const completedLessons = user.progress.filter((p: any) => courseLessons.includes(p.lessonId) && p.completed).length;
      const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      
      const timeSpentInCourse = user.learningSessions
        .filter((s: any) => s.courseId === en.course.id)
        .reduce((sum: number, s: any) => sum + s.timeSpent, 0);

      return {
        id: en.course.id,
        title: en.course.title,
        enrolledAt: en.enrolledAt,
        progress: progressPercent,
        completedLessons,
        totalLessons,
        timeSpent: timeSpentInCourse,
        isCompleted: progressPercent === 100
      };
    });

    const totalTimeSpent = courses.reduce((sum: number, c: any) => sum + c.timeSpent, 0);
    const overallProgress = courses.length > 0 ? Math.round(courses.reduce((sum: number, c: any) => sum + c.progress, 0) / courses.length) : 0;

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        department: user.department?.name || "Unassigned",
        lastLogin: user.lastLoginAt,
        createdAt: user.createdAt
      },
      stats: {
        totalTimeSpent,
        overallProgress,
        coursesCompleted: courses.filter((c: any) => c.isCompleted).length,
        coursesEnrolled: courses.length
      },
      courses,
      activity: user.activityLogs
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
