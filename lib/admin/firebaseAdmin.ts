import fs from "fs";
import path from "path";
import { cert, getApps, initializeApp, applicationDefault, App, ServiceAccount } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

/**
 * Firebase Admin SDK (server only). Bypasses Firestore security rules, so it is the
 * ONLY way the Host console and trusted server routes touch the database.
 *
 * Credentials, first match wins:
 *   FIREBASE_SERVICE_ACCOUNT_KEY   – the service-account JSON (raw or base64)
 *   FIREBASE_SERVICE_ACCOUNT_PATH  – path to the downloaded JSON file
 *   GOOGLE_APPLICATION_CREDENTIALS – standard Google ADC path
 */
export class AdminNotConfiguredError extends Error {
  constructor() {
    super(
      "Firebase Admin SDK is not configured. Add FIREBASE_SERVICE_ACCOUNT_PATH (or FIREBASE_SERVICE_ACCOUNT_KEY) to .env.local and restart the server."
    );
  }
}

const APP_NAME = "projecthub-admin";

function loadServiceAccount(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (raw) {
    const json = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
    return JSON.parse(json);
  }
  const p = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();
  if (p) {
    const abs = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
    return JSON.parse(fs.readFileSync(abs, "utf8"));
  }
  return null;
}

let cached: App | null = null;

function getAdminApp(): App {
  if (cached) return cached;
  const existing = getApps().find((a) => a.name === APP_NAME);
  if (existing) return (cached = existing);

  const sa = loadServiceAccount();
  if (sa) {
    cached = initializeApp({ credential: cert(sa) }, APP_NAME);
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    cached = initializeApp({ credential: applicationDefault() }, APP_NAME);
  } else {
    throw new AdminNotConfiguredError();
  }
  return cached;
}

export function isAdminSdkConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS
  );
}

let dbCached: Firestore | null = null;
export function adminDb(): Firestore {
  if (dbCached) return dbCached;
  dbCached = getFirestore(getAdminApp());
  try {
    dbCached.settings({ ignoreUndefinedProperties: true });
  } catch {
    /* settings() can only be called once per instance */
  }
  return dbCached;
}

export function adminAuth(): Auth {
  return getAuth(getAdminApp());
}

/** Verifies a Firebase ID token sent as "Authorization: Bearer <token>". */
export async function verifyBearer(req: Request) {
  const h = req.headers.get("authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7).trim() : "";
  if (!token) return null;
  const auth = adminAuth(); // throws AdminNotConfiguredError, deliberately not swallowed
  try {
    // checkRevoked: a suspended student's still-valid tokens are rejected immediately
    return await auth.verifyIdToken(token, true);
  } catch {
    return null;
  }
}
