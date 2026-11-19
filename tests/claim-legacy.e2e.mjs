/**
 * End-to-end test of /api/account/claim-legacy and /api/students/lookup against the
 * LOCAL Firestore + Auth emulators. Never touches production:
 *   • refuses to run unless the emulator env vars are set
 *   • the Next server gets a freshly generated fake service account for "demo-projecthub",
 *     which cannot authenticate to Google
 *
 *   npm run test:claim
 */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { generateKeyPairSync } from "node:crypto";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const FS = process.env.FIRESTORE_EMULATOR_HOST;
const AUTH = process.env.FIREBASE_AUTH_EMULATOR_HOST;
if (!FS || !AUTH) {
  console.error("Refusing to run: FIRESTORE_EMULATOR_HOST / FIREBASE_AUTH_EMULATOR_HOST not set (run via npm run test:claim).");
  process.exit(1);
}

const PROJECT = "demo-projecthub";
const PORT = 3100;
const BASE = `http://localhost:${PORT}`;

const app = initializeApp({ projectId: PROJECT }, "e2e");
const db = getFirestore(app);
const auth = getAuth(app);

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const fakeKey = JSON.stringify({
  type: "service_account",
  project_id: PROJECT,
  private_key_id: "fake",
  private_key: privateKey.export({ type: "pkcs8", format: "pem" }),
  client_email: `fake@${PROJECT}.iam.gserviceaccount.com`,
  client_id: "0",
});

async function seed() {
  const users = db.collection("users");
  await users.doc("usn_4mw23ad099").set({
    uid: "usn_4mw23ad099", email: "4mw23ad099@student.college.edu", fullName: "USN Student",
    studentCode: "PH-2026-USN9", usn: "4MW23AD099", phoneNumber: "9999999999", profileCompleted: true,
    updatedAt: "2026-03-01T00:00:00.000Z", role: "student",
  });
  await users.doc("google-testuserexamplecom").set({
    uid: "google-testuserexamplecom", email: "testuser@example.com", fullName: "Older", profileCompleted: true,
    updatedAt: "2026-01-01T00:00:00.000Z", role: "student",
  });
  await users.doc("google-1791649172415").set({
    uid: "google-1791649172415", email: "testuser@example.com", fullName: "Newer", profileCompleted: true,
    updatedAt: "2026-02-01T00:00:00.000Z", role: "student",
  });
  await users.doc("email_sus_example_com").set({
    uid: "email_sus_example_com", email: "sus@example.com", fullName: "Suspended", profileCompleted: true,
    accountStatus: "suspended", suspendedReason: "test", role: "student",
  });
  // A real-uid profile whose (editable) email was set to someone else's — must NOT be claimable
  await users.doc("attackerRealUid0000000000000").set({
    uid: "attackerRealUid0000000000000", email: "victim@example.com", fullName: "Attacker", profileCompleted: true,
  });
  await db.collection("projects").doc("p-usn").set({ id: "p-usn", ownerId: "usn_4mw23ad099", status: "Draft", title: "USN project" });
  await db.collection("projects").doc("p-google").set({ id: "p-google", ownerId: "google-1791649172415", status: "Published", title: "G project" });
}

async function signUp(email, password = "secret123") {
  const r = await fetch(`http://${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const j = await r.json();
  assert.ok(j.idToken, `sign-up failed for ${email}: ${JSON.stringify(j)}`);
  return { uid: j.localId, token: j.idToken };
}

const claim = (token) =>
  fetch(`${BASE}/api/account/claim-legacy`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }).then(
    async (r) => ({ status: r.status, body: await r.json() })
  );

async function waitForServer() {
  for (let i = 0; i < 120; i++) {
    try {
      const r = await fetch(`${BASE}/api/settings`);
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Next server did not start");
}

let server;
let passed = 0;
const check = async (name, fn) => {
  await fn();
  passed++;
  console.log(`✔ ${name}`);
};

try {
  await seed();
  server = spawn("npx", ["next", "dev", "-p", String(PORT)], {
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      FIREBASE_SERVICE_ACCOUNT_KEY: fakeKey,
      FIREBASE_SERVICE_ACCOUNT_PATH: "",
      GOOGLE_APPLICATION_CREDENTIALS: "",
      GCLOUD_PROJECT: PROJECT,
    },
  });
  server.stderr.on("data", (d) => process.env.E2E_VERBOSE && process.stderr.write(d));
  await waitForServer();

  await check("USN student's legacy profile + project move to the new account", async () => {
    const { uid, token } = await signUp("4mw23ad099@student.college.edu");
    const r = await claim(token);
    assert.equal(r.status, 200);
    assert.equal(r.body.status, "migrated");
    assert.equal(r.body.movedProjects, 1);
    const me = (await db.collection("users").doc(uid).get()).data();
    assert.equal(me.fullName, "USN Student");
    assert.equal(me.uid, uid);
    assert.deepEqual(me.migratedFrom, ["usn_4mw23ad099"]);
    assert.equal((await db.collection("users").doc("usn_4mw23ad099").get()).exists, false);
    assert.equal((await db.collection("projects").doc("p-usn").get()).data().ownerId, uid);
    const logs = await db.collection("auditLogs").where("targetId", "==", uid).get();
    assert.equal(logs.size, 1);
    assert.equal(logs.docs[0].data().action, "account.claim_legacy");
    // second call is a no-op
    assert.equal((await claim(token)).body.status, "exists");
  });

  await check("both old google- ids (hyphen format) are merged; newest profile wins", async () => {
    const { uid, token } = await signUp("testuser@example.com");
    const r = await claim(token);
    assert.equal(r.body.status, "migrated");
    const me = (await db.collection("users").doc(uid).get()).data();
    assert.equal(me.fullName, "Newer");
    assert.deepEqual([...me.migratedFrom].sort(), ["google-1791649172415", "google-testuserexamplecom"]);
    assert.equal((await db.collection("users").doc("google-testuserexamplecom").get()).exists, false);
    assert.equal((await db.collection("users").doc("google-1791649172415").get()).exists, false);
    assert.equal((await db.collection("projects").doc("p-google").get()).data().ownerId, uid);
  });

  await check("a real-uid profile with a copied email cannot be claimed", async () => {
    const { token } = await signUp("victim@example.com");
    assert.equal((await claim(token)).body.status, "none");
    assert.equal((await db.collection("users").doc("attackerRealUid0000000000000").get()).exists, true);
  });

  await check("claiming a suspended legacy profile keeps it suspended and disables sign-in", async () => {
    const { uid, token } = await signUp("sus@example.com");
    const r = await claim(token);
    assert.equal(r.body.status, "migrated");
    assert.equal((await db.collection("users").doc(uid).get()).data().accountStatus, "suspended");
    assert.equal((await auth.getUser(uid)).disabled, true);
  });

  await check("claim rejects missing and forged tokens", async () => {
    assert.equal((await fetch(`${BASE}/api/account/claim-legacy`, { method: "POST" })).status, 401);
    assert.equal((await claim("forged.token.value")).status, 401);
  });

  await check("teammate lookup returns a public card only (no phone number)", async () => {
    const { token } = await signUp("looker@example.com");
    const r = await fetch(`${BASE}/api/students/lookup?q=PH-2026-USN9`, { headers: { Authorization: `Bearer ${token}` } });
    const { student } = await r.json();
    assert.equal(student.fullName, "USN Student");
    assert.equal(student.phoneNumber, undefined);
    assert.equal(student.accountStatus, undefined);
    // suffix search works too
    const r2 = await fetch(`${BASE}/api/students/lookup?q=USN9`, { headers: { Authorization: `Bearer ${token}` } });
    assert.equal((await r2.json()).student?.fullName, "USN Student");
    // and it needs a signed-in user
    assert.equal((await fetch(`${BASE}/api/students/lookup?q=USN9`)).status, 401);
  });

  console.log(`\n${passed} end-to-end checks passed`);
} catch (err) {
  console.error("\n✘ FAILED:", err?.message || err);
  process.exitCode = 1;
} finally {
  if (server) {
    if (process.platform === "win32") spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"], { shell: true });
    else server.kill("SIGTERM");
  }
  setTimeout(() => process.exit(process.exitCode || 0), 1500);
}
