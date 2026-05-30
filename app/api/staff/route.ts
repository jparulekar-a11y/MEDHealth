import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const staff = await prisma.user.findMany({
    where: { role: { in: ["DOCTOR", "NURSE"] } },
    select: { id: true, name: true, role: true, email: true, avatar: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(staff);
}
