import { db } from "@/lib/db";
import { consultations } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId");

  try {
    const result = patientId
      ? await db
          .select()
          .from(consultations)
          .where(eq(consultations.patientId, patientId))
      : await db.select().from(consultations);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch consultations",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const patientId = formData.get("patientId") as string;
  const title = formData.get("title") as string;
  const audioBlob = formData.get("audioBlob") as Blob;

  if (!patientId || !title || !audioBlob) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await db
      .insert(consultations)
      .values({
        patientId,
        title,
        audioBlob: buffer,
      })
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create consultation",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
