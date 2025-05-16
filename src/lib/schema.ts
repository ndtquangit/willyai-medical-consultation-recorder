import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { customType } from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; driverData: string }>({
  dataType() {
    return "bytea";
  },
  toDriver(value: Buffer): string {
    return `\\x${value.toString('hex')}`;
  },
});

export const consultations = pgTable("consultations", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: text("patient_id").notNull(),
  title: text("title").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  audioBlob: bytea("audio_blob").notNull(),
});

export type Consultation = typeof consultations.$inferSelect;
export type NewConsultation = typeof consultations.$inferInsert;
