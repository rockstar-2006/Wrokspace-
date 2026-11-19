import { adminDb } from "./firebaseAdmin";
import { normalizeSettings, PortalSettings } from "./types";

const ref = () => adminDb().collection("settings").doc("portal");

/** Reads portal settings; falls back to defaults if the Admin SDK isn't configured or the read fails. */
export async function readPortalSettings(): Promise<PortalSettings> {
  try {
    const snap = await ref().get();
    return normalizeSettings(snap.exists ? (snap.data() as Partial<PortalSettings>) : null);
  } catch (err) {
    console.warn("[settings] read failed, using defaults:", (err as Error)?.message);
    return normalizeSettings(null);
  }
}

export async function writePortalSettings(settings: PortalSettings): Promise<void> {
  await ref().set(JSON.parse(JSON.stringify(settings)));
}
