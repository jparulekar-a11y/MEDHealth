import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const patients = await prisma.patient.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
      vitals: { orderBy: { recordedAt: "desc" }, take: 1 },
      alerts: { where: { acknowledged: false }, take: 3 },
      _count: { select: { messages: { where: { read: false } } } },
    },
    orderBy: { roomNumber: "asc" },
  });

  return NextResponse.json(patients);
}
