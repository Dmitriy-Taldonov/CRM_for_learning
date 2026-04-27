import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { answers, timeSpent } = await req.json(); // answers is { [questionId]: [optionIds] }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    let correctCount = 0;

    for (const question of quiz.questions) {
      const userOptionIds = answers[question.id] || [];
      const correctOptionIds = question.options.filter((o: any) => o.isCorrect).map((o: any) => o.id);

      if (question.type === "SINGLE_CHOICE") {
        if (userOptionIds.length === 1 && correctOptionIds.includes(userOptionIds[0])) {
          correctCount++;
        }
      } else {
        // MULTIPLE_CHOICE: Must match exactly
        const isCorrect = 
          userOptionIds.length === correctOptionIds.length && 
          userOptionIds.every((id: string) => correctOptionIds.includes(id));
        if (isCorrect) {
          correctCount++;
        }
      }
    }

    const passed = correctCount >= quiz.passingThreshold;

    const submission = await prisma.quizSubmission.create({
      data: {
        userId: session.user.id,
        quizId: quiz.id,
        score: correctCount,
        passed,
        timeSpent,
      },
    });

    return NextResponse.json({
      submission,
      totalQuestions: quiz.questions.length,
      correctCount,
      passed,
    });
  } catch (error) {
    console.error("Quiz submission error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
