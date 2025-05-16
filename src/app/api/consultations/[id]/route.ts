import { db } from "@/lib/db";
import { consultations } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Required for dynamic route segments
export const dynamic = 'force-dynamic';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Consultation ID is required" },
        { status: 400 }
      );
    }

    const deletedRecord = await db
      .delete(consultations)
      .where(eq(consultations.id, id))
      .returning();

    if (deletedRecord.length === 0) {
      return NextResponse.json(
        { error: "Consultation not found" },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
