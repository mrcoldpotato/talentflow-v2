// src/api/msw/handler.ts
import { http, HttpResponse } from "msw";
import { setupWorker } from "msw/browser";
import { db } from "../../db/dexie";
import { seedIfEmpty } from "../../db/seed";
import type { Job, Candidate, TimelineEvent, Assessment, CandidateStage } from "../../types";

// ---------------- Utilities ----------------
function randomDelay(min = 200, max = 1200) {
  return min + Math.floor(Math.random() * (max - min));
}
function maybeFail(chance = 0.08) {
  return Math.random() < chance;
}

// Seed database if empty
await seedIfEmpty();

// ---------------- Handlers ----------------
export const handlers = [
  // ---------------- Jobs Handlers ----------------
http.get("/api/jobs", async ({ request }) => {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";
  const page = Number(url.searchParams.get("page") || "1");
  const pageSize = Number(url.searchParams.get("pageSize") || "10");

  let all = await db.jobs.toArray();
  if (search) all = all.filter(j => j.title.toLowerCase().includes(search.toLowerCase()));
  if (status) all = all.filter(j => j.status === status);
  all.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const start = (page - 1) * pageSize;
  const items = all.slice(start, start + pageSize);

  await new Promise(r => setTimeout(r, randomDelay()));
  return HttpResponse.json({ total: all.length, items }, { status: 200 });
}),

http.get("/api/jobs/:id", async ({ params }) => {
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  if (!id) return HttpResponse.json({ error: "Job ID required" }, { status: 400 });

  const job = await db.jobs.get(id);
  if (!job) return HttpResponse.json({ error: "Job not found" }, { status: 404 });

  await new Promise(r => setTimeout(r, randomDelay()));
  return HttpResponse.json(job, { status: 200 });
}),

http.post("/api/jobs", async ({ request }) => {
  const data = (await request.json()) as Omit<Job, "id" | "createdAt" | "updatedAt" | "order">;

  // --- Check for unique slug ---
  const existingSlug = await db.jobs.where("slug").equals(data.slug).first();
  if (existingSlug) {
    return HttpResponse.json({ error: "Slug must be unique" }, { status: 400 });
  }

  if (maybeFail()) return HttpResponse.json({ error: "Simulated write error" }, { status: 500 });

  const job: Job = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    order: (await db.jobs.count()) || 0,
  };

  await db.jobs.add(job);
  await new Promise(r => setTimeout(r, randomDelay()));
  return HttpResponse.json(job, { status: 201 });
}),

http.put("/api/jobs/:id", async ({ request, params }) => {
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  if (!id) return HttpResponse.json({ error: "Job ID required" }, { status: 400 });

  const existing = await db.jobs.get(id);
  if (!existing) return HttpResponse.json({ error: "Job not found" }, { status: 404 });

  const data = await request.json() as Partial<Job>;

  // --- Check slug uniqueness on update ---
  if (data.slug && data.slug !== existing.slug) {
    const slugTaken = await db.jobs.where("slug").equals(data.slug).first();
    if (slugTaken) {
      return HttpResponse.json({ error: "Slug must be unique" }, { status: 400 });
    }
  }

  const updated: Job = { ...existing, ...data, updatedAt: new Date().toISOString() };
  await db.jobs.put(updated);

  await new Promise(r => setTimeout(r, randomDelay()));
  return HttpResponse.json(updated, { status: 200 });
}),

http.patch("/api/jobs/:id/reorder", async ({ request, params }) => {
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  if (!id) return HttpResponse.json({ error: "Job ID required" }, { status: 400 });

  const { fromOrder, toOrder } = await request.json() as { fromOrder: number; toOrder: number };
  const allJobs = await db.jobs.toArray();
  allJobs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Remove job from old index
  const [moved] = allJobs.splice(fromOrder, 1);
  // Insert job at new index
  allJobs.splice(toOrder, 0, moved);

  // Update order for all jobs
  await Promise.all(allJobs.map((job, idx) => db.jobs.update(job.id, { order: idx })));

  await new Promise(r => setTimeout(r, randomDelay()));
  return HttpResponse.json({ status: 'ok' }, { status: 200 });
}),



  // -------- Candidates --------
  http.get("/api/candidates", async ({ request }) => {
    const url = new URL(request.url);
    const jobId = url.searchParams.get("jobId") || null;
    const search = url.searchParams.get("search")?.toLowerCase() || "";

    let all = await db.candidates.toArray();
    if (jobId) all = all.filter(c => c.jobId === jobId);
    if (search) all = all.filter(c =>
      c.name.toLowerCase().includes(search) ||
      c.email.toLowerCase().includes(search)
    );

    all.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    await new Promise(r => setTimeout(r, randomDelay()));
    return HttpResponse.json(all, { status: 200 });
  }),

  http.post("/api/candidates", async ({ request }) => {
    const data = (await request.json()) as Partial<Candidate>;

    const candidate: Candidate = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      name: data.name?.trim() || "Unnamed",
      email: data.email?.trim() || "",
      stage: (data.stage as CandidateStage) || "applied",
      jobId: data.jobId ?? undefined,
    };

    await db.candidates.add(candidate);

    await db.timelines.add({
      id: crypto.randomUUID(),
      candidateId: candidate.id,
      type: "note",
      note: `${candidate.name} added`,
      ts: new Date().toISOString(),
    });

    await new Promise(r => setTimeout(r, randomDelay()));
    return HttpResponse.json(candidate, { status: 201 });
  }),

  http.get("/api/candidates/:id", async ({ params }) => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!id) return HttpResponse.json({ error: "Candidate ID required" }, { status: 400 });

    const candidate = await db.candidates.get(id);
    if (!candidate) return HttpResponse.json({ error: "Candidate not found" }, { status: 404 });

    await new Promise(r => setTimeout(r, randomDelay()));
    return HttpResponse.json(candidate, { status: 200 });
  }),

  http.patch("/api/candidates/:id/stage", async ({ request, params }) => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!id) return HttpResponse.json({ error: "Candidate ID required" }, { status: 400 });

    const body = (await request.json()) as { stage: CandidateStage };
    const existing = await db.candidates.get(id);
    if (!existing) return HttpResponse.json({ error: "Candidate not found" }, { status: 404 });

    const updated = { ...existing, stage: body.stage };
    await db.candidates.put(updated);

    await db.timelines.add({
      id: crypto.randomUUID(),
      candidateId: id,
      type: "stage",
      note: `Stage changed to ${body.stage}`,
      ts: new Date().toISOString(),
    });

    await new Promise(r => setTimeout(r, randomDelay()));
    return HttpResponse.json(updated, { status: 200 });
  }),

  // -------- Timeline --------
  http.get("/api/timeline", async ({ request }) => {
    const url = new URL(request.url);
    const candidateId = url.searchParams.get("candidateId");
    if (!candidateId) return HttpResponse.json({ error: "candidateId required" }, { status: 400 });

    let events = await db.timelines.where({ candidateId }).toArray();
    events.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
    await new Promise(r => setTimeout(r, randomDelay()));
    return HttpResponse.json(events, { status: 200 });
  }),

  http.post("/api/timeline", async ({ request }) => {
    const data = (await request.json()) as Partial<TimelineEvent>;
    const event: TimelineEvent = {
      id: crypto.randomUUID(),
      candidateId: data.candidateId ?? "",
      type: data.type ?? "note",
      note: data.note ?? "",
      ts: new Date().toISOString(),
    };
    await db.timelines.add(event);
    await new Promise(r => setTimeout(r, randomDelay()));
    return HttpResponse.json(event, { status: 201 });
  }),

  // -------- Assessments --------
  http.get("/api/assessments/:jobId", async ({ params }) => {
    const jobId = Array.isArray(params.jobId) ? params.jobId[0] : params.jobId;
    if (!jobId) return HttpResponse.json({ error: "Job ID required" }, { status: 400 });

    let assessment = await db.assessments.get(jobId);
    if (!assessment) assessment = { jobId, title: "New Assessment", sections: [] };

    await new Promise(r => setTimeout(r, randomDelay()));
    return HttpResponse.json(assessment, { status: 200 });
  }),

  http.put("/api/assessments/:jobId", async ({ request }) => {
    const data = (await request.json()) as Assessment;
    await db.assessments.put(data);
    await new Promise(r => setTimeout(r, randomDelay()));
    return HttpResponse.json(data, { status: 200 });
  }),

  http.post("/api/assessments/:jobId/submit", async ({ request }) => {
    const submission = await request.json();
    await new Promise(r => setTimeout(r, randomDelay()));
    return HttpResponse.json({ status: "ok", submission }, { status: 201 });
  }),
];

// ---------------- Start Worker ----------------
export const worker = setupWorker(...handlers);
