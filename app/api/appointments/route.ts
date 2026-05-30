import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emitAppointmentUpdate } from "@/lib/socket-server";

export async function GET() {
  const appointments = await prisma.appointment.findMany({
    include: {
      patient: {
        include: { user: { select: { name: true } } },
      },
      doctor: { select: { name: true } },
    },
    orderBy: { scheduledAt: "asc" },
    take: 50,
  });

  return NextResponse.json(appointments);
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status, notes } = await request.json();

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        patient: {
          include: { user: { select: { name: true } } },
        },
        doctor: { select: { name: true } },
      },
    });

    try {
      emitAppointmentUpdate({
        ...appointment,
        scheduledAt: appointment.scheduledAt.toISOString(),
      });
    } catch {
      // Socket may not be initialized
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { patientId, doctorId, scheduledAt, reason, duration } = await request.json();

    if (!patientId || !doctorId || !scheduledAt || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        scheduledAt: new Date(scheduledAt),
        reason,
        duration: duration || 30,
      },
      include: {
        patient: {
          include: { user: { select: { name: true } } },
        },
        doctor: { select: { name: true } },
      },
    });

    try {
      emitAppointmentUpdate({
        ...appointment,
        scheduledAt: appointment.scheduledAt.toISOString(),
      });
    } catch {
      // Socket may not be initialized
    }

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}
