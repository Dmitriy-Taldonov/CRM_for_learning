import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, passingThreshold, timeLimit, questions } = await req.json();

    // Update Quiz and its questions in a transaction
    const updatedQuiz = await prisma.$transaction(async (tx) => {
      // 1. Update basic quiz info
      await tx.quiz.update({
        where: { id },
        data: {
          title,
          description,
          passingThreshold,
          timeLimit,
        },
      });

      // 2. Handle questions (this is a simple sync: delete all and recreate or patch?)
      // For simplicity in the builder, we often send the whole questions array.
      if (questions) {
        // Delete existing questions (and their options via Cascade)
        await tx.question.deleteMany({ where: { quizId: id } });

        // Create new questions and options
        for (const [qIdx, q] of questions.entries()) {
          await tx.question.create({
            data: {
              quizId: id,
              text: q.text,
              type: q.type,
              order: qIdx + 1,
              options: {
                create: q.options.map((o: any) => ({
                  text: o.text,
                  isCorrect: o.isCorrect,
                })),
              },
            },
          });
        }
      }

      return await tx.quiz.findUnique({
        where: { id: id },
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: {
              options: true,
            },
          },
        },
      });
    });

    return NextResponse.json(updatedQuiz);
  } catch (error) {
    console.error("Quiz update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.quiz.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
