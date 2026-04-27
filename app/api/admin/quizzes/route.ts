import { NextResponse } from "next/server"; // refreshed
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { moduleId, title, description, passingThreshold, timeLimit } = await req.json();

    if (!moduleId || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get the highest order to append
    const lastQuiz = await prisma.quiz.findFirst({
      where: { moduleId },
      orderBy: { order: "desc" },
    });
    const lastLesson = await prisma.lesson.findFirst({
        where: { moduleId },
        orderBy: { order: "desc" },
    });
    
    // We want quizzes to be part of the module flow. 
    // For now, let's just use simple ordering within its own collection or mixed?
    // The current schema has separate lists. 
    // Usually, you want mixed order. Let's just use the count of (lessons + quizzes) + 1.
    const quizCount = await prisma.quiz.count({ where: { moduleId } });
    const lessonCount = await prisma.lesson.count({ where: { moduleId } });

    const quiz = await prisma.quiz.create({
      data: {
        moduleId,
        title,
        description,
        passingThreshold: passingThreshold || 1,
        timeLimit: timeLimit || null,
        order: quizCount + lessonCount + 1,
      },
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Failed to create quiz:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
