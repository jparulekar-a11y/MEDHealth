import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.alert.deleteMany();
  await prisma.message.deleteMany();
  await prisma.vitalReading.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  const doctor1 = await prisma.user.create({
    data: {
      email: "dr.smith@medhealth.com",
      name: "Dr. Sarah Smith",
      role: "DOCTOR",
      passkey: "1234",
      avatar: "SS",
    },
  });

  const doctor2 = await prisma.user.create({
    data: {
      email: "dr.patel@medhealth.com",
      name: "Dr. Raj Patel",
      role: "DOCTOR",
      passkey: "5678",
      avatar: "RP",
    },
  });

  const doctor3 = await prisma.user.create({
    data: {
      email: "dr.jaideep@medhealth.com",
      name: "Dr. Jaideep",
      role: "DOCTOR",
      passkey: "1111",
      avatar: "JD",
    },
  });

  const nurse1 = await prisma.user.create({
    data: {
      email: "nurse.jones@medhealth.com",
      name: "Emily Jones, RN",
      role: "NURSE",
      avatar: "EJ",
    },
  });

  const patients = await Promise.all([
    prisma.user.create({
      data: {
        email: "john.doe@patient.com",
        name: "John Doe",
        role: "PATIENT",
        avatar: "JD",
        patientProfile: {
          create: {
            dateOfBirth: new Date("1965-03-15"),
            bloodType: "A+",
            roomNumber: "201A",
            condition: "Hypertension, Type 2 Diabetes",
          },
        },
      },
      include: { patientProfile: true },
    }),
    prisma.user.create({
      data: {
        email: "maria.garcia@patient.com",
        name: "Maria Garcia",
        role: "PATIENT",
        avatar: "MG",
        patientProfile: {
          create: {
            dateOfBirth: new Date("1978-07-22"),
            bloodType: "O-",
            roomNumber: "305B",
            condition: "Post-operative recovery (hip replacement)",
          },
        },
      },
      include: { patientProfile: true },
    }),
    prisma.user.create({
      data: {
        email: "robert.chen@patient.com",
        name: "Robert Chen",
        role: "PATIENT",
        avatar: "RC",
        patientProfile: {
          create: {
            dateOfBirth: new Date("1990-11-08"),
            bloodType: "B+",
            roomNumber: "112C",
            condition: "Pneumonia, respiratory monitoring",
          },
        },
      },
      include: { patientProfile: true },
    }),
    prisma.user.create({
      data: {
        email: "linda.williams@patient.com",
        name: "Linda Williams",
        role: "PATIENT",
        avatar: "LW",
        patientProfile: {
          create: {
            dateOfBirth: new Date("1955-01-30"),
            bloodType: "AB+",
            roomNumber: "410A",
            condition: "Cardiac arrhythmia monitoring",
          },
        },
      },
      include: { patientProfile: true },
    }),
  ]);

  const now = new Date();

  for (const patient of patients) {
    if (!patient.patientProfile) continue;

    for (let i = 0; i < 8; i++) {
      const recordedAt = new Date(now.getTime() - i * 15 * 60 * 1000);
      await prisma.vitalReading.create({
        data: {
          patientId: patient.patientProfile.id,
          heartRate: 68 + Math.floor(Math.random() * 20),
          systolicBP: 115 + Math.floor(Math.random() * 20),
          diastolicBP: 72 + Math.floor(Math.random() * 12),
          oxygenSat: 95 + Math.floor(Math.random() * 4),
          temperature: 36.4 + Math.random() * 0.8,
          recordedAt,
          source: "monitor",
        },
      });
    }
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  await prisma.appointment.create({
    data: {
      patientId: patients[0].patientProfile!.id,
      doctorId: doctor1.id,
      scheduledAt: tomorrow,
      reason: "Follow-up: blood pressure review",
      status: "SCHEDULED",
    },
  });

  await prisma.appointment.create({
    data: {
      patientId: patients[2].patientProfile!.id,
      doctorId: doctor2.id,
      scheduledAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      reason: "Respiratory assessment",
      status: "IN_PROGRESS",
    },
  });

  await prisma.message.create({
    data: {
      patientId: patients[0].patientProfile!.id,
      senderId: nurse1.id,
      content: "Good morning John, I'll be checking your vitals in 10 minutes.",
    },
  });

  await prisma.message.create({
    data: {
      patientId: patients[0].patientProfile!.id,
      senderId: patients[0].id,
      content: "Thank you, I'm feeling a bit dizzy this morning.",
    },
  });

  await prisma.alert.create({
    data: {
      patientId: patients[2].patientProfile!.id,
      assignedTo: doctor2.id,
      severity: "WARNING",
      title: "SpO2 Warning",
      message: "Oxygen saturation dropped to 92% — monitor closely.",
    },
  });

  console.log("Seed complete:");
  console.log(`  ${patients.length} patients`);
  console.log(`  2 doctors, 1 nurse`);
  console.log(`  Sample vitals, appointments, messages, alerts`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
