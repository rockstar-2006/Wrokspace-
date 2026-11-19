import { adminDb } from "./firebaseAdmin";
import { normalizeSettings, PortalSettings, DEFAULT_PORTAL_SETTINGS } from "./types";

const globalForSettings = globalThis as unknown as {
  _fallbackPortalSettings?: PortalSettings;
};

const ref = () => adminDb().collection("settings").doc("portal");

/** Reads portal settings; falls back to defaults or in-memory settings if the Admin SDK isn't configured. */
export async function readPortalSettings(): Promise<PortalSettings> {
  try {
    const snap = await ref().get();
    return normalizeSettings(snap.exists ? (snap.data() as Partial<PortalSettings>) : null);
  } catch (err) {
    if (!globalForSettings._fallbackPortalSettings) {
      globalForSettings._fallbackPortalSettings = normalizeSettings(null);
    }
    return globalForSettings._fallbackPortalSettings;
  }
}

export async function writePortalSettings(settings: PortalSettings): Promise<void> {
  try {
    await ref().set(JSON.parse(JSON.stringify(settings)));
  } catch (err) {
    globalForSettings._fallbackPortalSettings = normalizeSettings(settings);
  }
}
