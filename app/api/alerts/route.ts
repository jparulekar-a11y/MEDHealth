import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emitAlertUpdate } from "@/lib/socket-server";

export async function GET() {
  const alerts = await prisma.alert.findMany({
    where: { acknowledged: false },
    include: {
      patient: {
        include: { user: { select: { name: true } } },
      },
      assignee: { select: { name: true } },
    },
    orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
    take: 50,
  });

  return NextResponse.json(alerts);
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, acknowledged } = await request.json();

    const alert = await prisma.alert.update({
      where: { id },
      data: {
        acknowledged: acknowledged ?? true,
        resolvedAt: acknowledged ? new Date() : null,
      },
      include: {
        patient: {
          include: { user: { select: { name: true } } },
        },
      },
    });

    try {
      emitAlertUpdate({
        ...alert,
        createdAt: alert.createdAt.toISOString(),
        resolvedAt: alert.resolvedAt?.toISOString() ?? null,
      });
    } catch {
      // Socket may not be initialized
    }

    return NextResponse.json(alert);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });
  }
}
