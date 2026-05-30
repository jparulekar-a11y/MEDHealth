import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { name, passkey } = await request.json();
    const trimmedName = name?.trim();
    const trimmedPasskey = passkey?.trim();

    if (!trimmedName || !trimmedPasskey) {
      return NextResponse.json({ error: "Name and passkey are required" }, { status: 400 });
    }

    if (!/^\d{4}$/.test(trimmedPasskey)) {
      return NextResponse.json({ error: "Passkey must be exactly 4 digits" }, { status: 400 });
    }

    const doctors = await prisma.user.findMany({
      where: { role: "DOCTOR" },
      select: { id: true, name: true, role: true, passkey: true },
    });

    const normalizedInput = trimmedName.toLowerCase();

    const doctor = doctors.find((d) => {
      const normalizedName = d.name.toLowerCase();
      const nameWithoutTitle = normalizedName.replace(/^dr\.\s*/i, "");

      return (
        normalizedName === normalizedInput ||
        normalizedName.includes(normalizedInput) ||
        normalizedInput.includes(nameWithoutTitle) ||
        nameWithoutTitle === normalizedInput
      );
    });

    if (!doctor || doctor.passkey !== trimmedPasskey) {
      return NextResponse.json(
        { error: "Invalid name or passkey. Check both fields and try again." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: doctor.id,
      name: doctor.name,
      role: doctor.role,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
