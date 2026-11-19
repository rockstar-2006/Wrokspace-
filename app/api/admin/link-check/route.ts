import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, jsonError } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";

const MAX_URLS = 12;
const TIMEOUT_MS = 8000;

/** Refuse obviously internal targets so the checker can't be used to probe the host network. */
function isPublicHttpUrl(raw: string): URL | null {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  const h = u.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    h === "localhost" ||
    h.endsWith(".localhost") ||
    h.endsWith(".local") ||
    h.endsWith(".internal") ||
    h === "0.0.0.0" ||
    h === "::1" ||
    /^127\./.test(h) ||
    /^10\./.test(h) ||
    /^192\.168\./.test(h) ||
    /^169\.254\./.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
    /^(fc|fd|fe80)/.test(h)
  ) {
    return null;
  }
  return u;
}

async function probe(url: URL) {
  const started = Date.now();
  const attempt = async (method: "HEAD" | "GET") => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      return await fetch(url, {
        method,
        redirect: "follow",
        signal: ctrl.signal,
        headers: { "User-Agent": "ProjectHub-LinkHealth/1.0" },
        cache: "no-store",
      });
    } finally {
      clearTimeout(t);
    }
  };
  try {
    let res = await attempt("HEAD");
    // Many hosts (incl. some CDNs) reject HEAD; confirm with GET before calling it broken
    if (res.status >= 400) res = await attempt("GET");
    return { ok: res.status < 400, status: res.status, ms: Date.now() - started };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      ms: Date.now() - started,
      error: err?.name === "AbortError" ? "Timed out" : err?.cause?.code || err?.message || "Unreachable",
    };
  }
}

/** POST /api/admin/link-check { urls: string[] } → reachability of each project link. */
export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await req.json().catch(() => null);
  const urls: string[] = Array.isArray(body?.urls)
    ? Array.from(new Set<string>(body.urls.map((u: unknown) => String(u).trim()).filter(Boolean))).slice(0, MAX_URLS)
    : [];
  if (!urls.length) return jsonError("No URLs to check");

  const results = await Promise.all(
    urls.map(async (raw) => {
      if (raw.startsWith("data:")) return { url: raw, ok: true, status: 200, ms: 0, note: "Embedded file" };
      const u = isPublicHttpUrl(raw);
      if (!u) return { url: raw, ok: false, status: 0, ms: 0, error: "Invalid or non-public URL" };
      return { url: raw, ...(await probe(u)) };
    })
  );
  return NextResponse.json({ results });
}
