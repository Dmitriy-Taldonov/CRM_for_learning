import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (session?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. General Stats
    const totalStudents = await prisma.user.count({ where: { role: "STUDENT" } });
    
    // We don't have login logs yet, so mock active users
    const active7Days = Math.floor(totalStudents * 0.8); 
    const active30Days = Math.floor(totalStudents * 0.95);

    // Fetch all progress to calculate overall averages
    const allProgress = await prisma.progress.findMany();
    const completedLessons = allProgress.filter((p: any) => p.completed).length;
    
    const enrollments = await prisma.enrollment.findMany({
      include: {
        user: true,
        course: {
          include: {
            modules: {
              include: { lessons: true }
            }
          }
        }
      }
    });

    let totalPossibleLessons = 0;
    let completelyFinishedCourses = 0;

    // Calculate per-employee stats
    const studentStatsMap = new Map();

    enrollments.forEach((en: any) => {
      const courseLessonsCount = en.course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
      totalPossibleLessons += courseLessonsCount;

      const studentProg = allProgress.filter((p: any) => p.userId === en.userId && en.course.modules.some((m: any) => m.lessons.some((l: any) => l.id === p.lessonId)));
      const completedCount = studentProg.filter((p: any) => p.completed).length;
      
      const isCompleted = courseLessonsCount > 0 && completedCount === courseLessonsCount;
      if (isCompleted) completelyFinishedCourses++;

      if (!studentStatsMap.has(en.userId)) {
        studentStatsMap.set(en.userId, { 
          id: en.userId, 
          email: en.user.email, 
          enrolledCount: 0, 
          completedCount: 0, 
          totalLessons: 0, 
          completedLessons: 0 
        });
      }
      const stat = studentStatsMap.get(en.userId);
      stat.enrolledCount++;
      if (isCompleted) stat.completedCount++;
      stat.totalLessons += courseLessonsCount;
      stat.completedLessons += completedCount;
    });

    const averageProgress = totalPossibleLessons > 0 ? Math.round((completedLessons / totalPossibleLessons) * 100) : 0;
    const courseCompletionRate = enrollments.length > 0 ? Math.round((completelyFinishedCourses / enrollments.length) * 100) : 0;

    const studentList = Array.from(studentStatsMap.values()).map((s: any) => ({
      ...s,
      progress: s.totalLessons > 0 ? Math.round((s.completedLessons / s.totalLessons) * 100) : 0
    }));

    const topEmployees = [...studentList].sort((a, b) => b.progress - a.progress).slice(0, 5);
    const laggingEmployees = [...studentList].sort((a, b) => a.progress - b.progress).slice(0, 5);

    // Mock Activity Graph Data
    const activityGraph = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        active: Math.floor(Math.random() * totalStudents) + 1
      };
    });

    // Course Analytics
    const allCourses = await prisma.course.findMany({
      include: {
        enrollments: true,
      }
    });

    const courseAnalytics = allCourses.map((c: any) => {
      return {
        id: c.id,
        title: c.title,
        enrollmentCount: c.enrollments.length,
        completionRate: Math.floor(Math.random() * 100), // Mocked for now
        engagementScore: Math.floor(Math.random() * 100)
      };
    });

    const popularCourses = [...courseAnalytics].sort((a, b) => b.enrollmentCount - a.enrollmentCount).slice(0, 3);
    const abandonedCourses = [...courseAnalytics].sort((a, b) => a.engagementScore - b.engagementScore).slice(0, 3);

    return NextResponse.json({
      general: {
        totalStudents,
        active7Days,
        active30Days,
        averageProgress,
        courseCompletionRate,
      },
      activityGraph,
      employees: {
        top: topEmployees,
        lagging: laggingEmployees
      },
      courses: {
        popular: popularCourses,
        abandoned: abandonedCourses
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
