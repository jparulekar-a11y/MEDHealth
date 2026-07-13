import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkVitalsForAlerts } from "@/lib/utils";
import { emitAlert, emitVitalReading } from "@/lib/socket-server";

export async function GET(request: NextRequest) {
  const patientId = request.nextUrl.searchParams.get("patientId");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50", 10);

  const where = patientId ? { patientId } : {};

  const vitals = await prisma.vitalReading.findMany({
    where,
    include: {
      patient: {
        include: { user: { select: { name: true } } },
      },
    },
    orderBy: { recordedAt: "desc" },
    take: limit,
  });

  return NextResponse.json(vitals);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, heartRate, systolicBP, diastolicBP, oxygenSat, temperature, source } =
      body;

    if (
      !patientId ||
      heartRate == null ||
      systolicBP == null ||
      diastolicBP == null ||
      oxygenSat == null ||
      temperature == null
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const reading = await prisma.vitalReading.create({
      data: {
        patientId,
        heartRate: parseInt(heartRate),
        systolicBP: parseInt(systolicBP),
        diastolicBP: parseInt(diastolicBP),
        oxygenSat: parseInt(oxygenSat),
        temperature: parseFloat(temperature),
        source: source || "monitor",
      },
      include: {
        patient: {
          include: { user: { select: { name: true } } },
        },
      },
    });

    const payload = {
      ...reading,
      recordedAt: reading.recordedAt.toISOString(),
    };

    try {
      emitVitalReading(payload);
    } catch {
      // Socket may not be initialized during build
    }

    const alertChecks = checkVitalsForAlerts({
      heartRate: reading.heartRate,
      systolicBP: reading.systolicBP,
      diastolicBP: reading.diastolicBP,
      oxygenSat: reading.oxygenSat,
      temperature: reading.temperature,
    });

    for (const alertData of alertChecks) {
      const alert = await prisma.alert.create({
        data: {
          patientId,
          severity: alertData.severity,
          title: alertData.title,
          message: alertData.message,
        },
        include: {
          patient: {
            include: { user: { select: { name: true } } },
          },
        },
      });

      try {
        emitAlert({
          ...alert,
          createdAt: alert.createdAt.toISOString(),
          resolvedAt: alert.resolvedAt?.toISOString() ?? null,
        });
      } catch {
        // Socket may not be initialized
      }
    }

    return NextResponse.json(reading, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to record vitals" }, { status: 500 });
  }
}
