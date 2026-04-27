import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { studentIds, message } = await request.json();

    if (!studentIds || !Array.isArray(studentIds) || !message) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Mocking message sending
    console.log(`Sending message to ${studentIds.length} students: ${message}`);
    
    // In a real app, you might use a mailer or a notification service here.

    return NextResponse.json({ success: studentIds, failed: [] });
  } catch (error) {
    console.error("Bulk message error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
