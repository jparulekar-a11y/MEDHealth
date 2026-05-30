import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emitMessage } from "@/lib/socket-server";

export async function GET(request: NextRequest) {
  const patientId = request.nextUrl.searchParams.get("patientId");

  if (!patientId) {
    return NextResponse.json({ error: "patientId required" }, { status: 400 });
  }

  const messages = await prisma.message.findMany({
    where: { patientId },
    include: {
      sender: { select: { id: true, name: true, role: true, avatar: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return NextResponse.json(messages);
}

export async function POST(request: NextRequest) {
  try {
    const { patientId, senderId, content } = await request.json();

    if (!patientId || !senderId || !content?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: { patientId, senderId, content: content.trim() },
      include: {
        sender: { select: { id: true, name: true, role: true, avatar: true } },
      },
    });

    try {
      emitMessage({
        ...message,
        createdAt: message.createdAt.toISOString(),
        sender: { name: message.sender.name, role: message.sender.role },
      });
    } catch {
      // Socket may not be initialized
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
