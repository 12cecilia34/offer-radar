import { and, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { jobStates } from "../../../db/schema";

export async function GET(request: Request) {
  const clientId = new URL(request.url).searchParams.get("clientId")?.trim();
  if (!clientId) return Response.json({ states: [] });
  const states = await getDb().select().from(jobStates).where(eq(jobStates.clientId, clientId));
  return Response.json({ states });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    clientId?: string;
    jobId?: string;
    saved?: boolean;
    status?: string;
  };
  const clientId = payload.clientId?.trim();
  const jobId = payload.jobId?.trim();
  const allowedStatuses = ["待申请", "准备中", "已申请"];
  if (!clientId || !jobId || (payload.status && !allowedStatuses.includes(payload.status))) {
    return Response.json({ error: "Invalid job state" }, { status: 400 });
  }

  const current = await getDb().select().from(jobStates).where(
    and(eq(jobStates.clientId, clientId), eq(jobStates.jobId, jobId)),
  ).limit(1);
  const values = {
    clientId,
    jobId,
    saved: payload.saved ?? current[0]?.saved ?? false,
    status: payload.status ?? current[0]?.status ?? "待申请",
    updatedAt: new Date().toISOString(),
  };

  await getDb().insert(jobStates).values(values).onConflictDoUpdate({
    target: [jobStates.clientId, jobStates.jobId],
    set: values,
  });
  return Response.json({ ok: true, state: values });
}

