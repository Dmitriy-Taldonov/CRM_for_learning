import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();
  if (session?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "students";

  try {
    if (type === "students") {
      const users = await prisma.user.findMany({
        where: { role: "STUDENT" },
        include: { department: true }
      });

      const csvRows = [
        ["ID", "Email", "Department", "Created At", "Last Login"],
        ...users.map((u: any) => [
          u.id, 
          u.email, 
          u.department?.name || "Unassigned", 
          new Date(u.createdAt).toISOString(),
          u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : "Never"
        ])
      ];

      const csvString = csvRows.map((row: any) => row.join(",")).join("\n");
      
      return new NextResponse(csvString, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="students_export_${new Date().toISOString().slice(0,10)}.csv"`
        }
      });
    }

    if (type === "courses") {
      const courses = await prisma.course.findMany({
        include: { enrollments: true, modules: { include: { lessons: true } } }
      });

      const csvRows = [
        ["ID", "Title", "Published", "Enrollments", "Total Lessons"],
        ...courses.map((c: any) => [
          c.id,
          `"${c.title.replace(/"/g, '""')}"`,
          c.published,
          c.enrollments.length,
          c.modules.reduce((sum: number, m: any) => sum + m.lessons.length, 0)
        ])
      ];

      const csvString = csvRows.map((row: any) => row.join(",")).join("\n");
      
      return new NextResponse(csvString, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="courses_export_${new Date().toISOString().slice(0,10)}.csv"`
        }
      });
    }

    return NextResponse.json({ error: "Invalid export type" }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
