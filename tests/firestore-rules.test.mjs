/**
 * Firestore security-rules tests (run against the local emulator — never touches production).
 *
 *   npm run test:rules
 */
import { readFileSync } from "node:fs";
import { test, before, after, beforeEach } from "node:test";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";

let env;
const ALICE = "alice-uid";
const BOB = "bob-uid";

const profile = (uid, extra = {}) => ({
  uid,
  fullName: uid,
  email: `${uid}@college.edu`,
  role: "student",
  studentCode: "PH-2026-TEST",
  skills: [],
  profileCompleted: true,
  ...extra,
});

const project = (id, ownerId, extra = {}) => ({
  id,
  title: `Project ${id}`,
  ownerId,
  status: "Pending review",
  category: "Web Apps",
  tags: [],
  ...extra,
});

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-projecthub",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
  });
});

after(async () => {
  await env?.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  // Seed with rules disabled (this is what the Admin SDK / existing data looks like)
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "users", ALICE), profile(ALICE));
    await setDoc(doc(db, "users", BOB), profile(BOB));
    await setDoc(doc(db, "projects", "a-draft"), project("a-draft", ALICE, { status: "Draft" }));
    await setDoc(doc(db, "projects", "a-pub"), project("a-pub", ALICE, { status: "Published", featured: true }));
    await setDoc(doc(db, "projects", "b-pending"), project("b-pending", BOB));
    await setDoc(doc(db, "auditLogs", "x"), { action: "test" });
    await setDoc(doc(db, "settings", "portal"), { submissionsOpen: true });
  });
});

const alice = () => env.authenticatedContext(ALICE, { email: `${ALICE}@college.edu` }).firestore();
const anon = () => env.unauthenticatedContext().firestore();

// ── users ──────────────────────────────────────────────────────────────

test("a student can read their own profile", async () => {
  await assertSucceeds(getDoc(doc(alice(), "users", ALICE)));
});

test("a student cannot read another student's profile", async () => {
  await assertFails(getDoc(doc(alice(), "users", BOB)));
});

test("a student cannot list all users", async () => {
  await assertFails(getDocs(collection(alice(), "users")));
});

test("signed-out visitors cannot read profiles", async () => {
  await assertFails(getDoc(doc(anon(), "users", ALICE)));
});

test("a new user can create their own profile as student", async () => {
  const db = env.authenticatedContext("carol", { email: "carol@college.edu" }).firestore();
  await assertSucceeds(setDoc(doc(db, "users", "carol"), profile("carol")));
});

test("a new user cannot create a profile under someone else's uid", async () => {
  const db = env.authenticatedContext("carol", { email: "carol@college.edu" }).firestore();
  await assertFails(setDoc(doc(db, "users", "dave"), profile("dave")));
});

test("a new user cannot create themselves as admin", async () => {
  const db = env.authenticatedContext("carol", { email: "carol@college.edu" }).firestore();
  await assertFails(setDoc(doc(db, "users", "carol"), profile("carol", { role: "admin" })));
});

test("a new user cannot pre-set accountStatus", async () => {
  const db = env.authenticatedContext("carol", { email: "carol@college.edu" }).firestore();
  await assertFails(setDoc(doc(db, "users", "carol"), profile("carol", { accountStatus: "active" })));
});

test("a student can edit normal profile fields (incl. contact email)", async () => {
  await assertSucceeds(
    setDoc(doc(alice(), "users", ALICE), { bio: "hello", email: "alice.real@college.edu" }, { merge: true })
  );
});

test("a student cannot change their own role", async () => {
  await assertFails(updateDoc(doc(alice(), "users", ALICE), { role: "user" }));
});

test("a student cannot un-suspend themselves", async () => {
  await env.withSecurityRulesDisabled((ctx) =>
    updateDoc(doc(ctx.firestore(), "users", ALICE), { accountStatus: "suspended" })
  );
  await assertFails(updateDoc(doc(alice(), "users", ALICE), { accountStatus: "active" }));
});

test("a suspended student cannot edit their profile", async () => {
  await env.withSecurityRulesDisabled((ctx) =>
    updateDoc(doc(ctx.firestore(), "users", ALICE), { accountStatus: "suspended" })
  );
  await assertFails(updateDoc(doc(alice(), "users", ALICE), { bio: "still here" }));
});

test("a student cannot delete their profile document", async () => {
  await assertFails(deleteDoc(doc(alice(), "users", ALICE)));
});

// ── projects ───────────────────────────────────────────────────────────

test("anyone can read a Published project", async () => {
  await assertSucceeds(getDoc(doc(anon(), "projects", "a-pub")));
});

test("signed-out visitors cannot read unpublished projects", async () => {
  await assertFails(getDoc(doc(anon(), "projects", "a-draft")));
});

test("owners can read their own drafts", async () => {
  await assertSucceeds(getDoc(doc(alice(), "projects", "a-draft")));
});

test("students cannot read someone else's pending project", async () => {
  await assertFails(getDoc(doc(alice(), "projects", "b-pending")));
});

test("the dashboard queries (published + my own) are allowed", async () => {
  await assertSucceeds(getDocs(query(collection(anon(), "projects"), where("status", "==", "Published"))));
  await assertSucceeds(getDocs(query(collection(alice(), "projects"), where("ownerId", "==", ALICE))));
});

test("listing every project is denied", async () => {
  await assertFails(getDocs(collection(alice(), "projects")));
});

test("a student can submit a new project for review", async () => {
  await assertSucceeds(setDoc(doc(alice(), "projects", "a-new"), project("a-new", ALICE)));
});

test("a student cannot create a project that is already Published", async () => {
  await assertFails(setDoc(doc(alice(), "projects", "a-new"), project("a-new", ALICE, { status: "Published" })));
});

test("a student cannot create a project owned by someone else", async () => {
  await assertFails(setDoc(doc(alice(), "projects", "a-new"), project("a-new", BOB)));
});

test("a student cannot mark their new project as featured", async () => {
  await assertFails(setDoc(doc(alice(), "projects", "a-new"), project("a-new", ALICE, { featured: true })));
});

test("a student can edit their draft and submit it for review", async () => {
  await assertSucceeds(
    setDoc(doc(alice(), "projects", "a-draft"), { title: "Better title", status: "Pending review" }, { merge: true })
  );
});

test("a student cannot publish their own project", async () => {
  await assertFails(updateDoc(doc(alice(), "projects", "a-draft"), { status: "Published" }));
});

test("editing a published project sends it back to review (allowed)", async () => {
  await assertSucceeds(updateDoc(doc(alice(), "projects", "a-pub"), { title: "v2", status: "Pending review" }));
});

test("a student cannot keep a project Published while editing it", async () => {
  await assertFails(updateDoc(doc(alice(), "projects", "a-pub"), { title: "sneaky edit" }));
});

test("a student cannot change featured or reviewer notes", async () => {
  await assertFails(updateDoc(doc(alice(), "projects", "a-draft"), { featured: true }));
  await assertFails(updateDoc(doc(alice(), "projects", "a-draft"), { reviewNotes: "Looks great — Host" }));
});

test("a student cannot transfer ownership", async () => {
  await assertFails(updateDoc(doc(alice(), "projects", "a-draft"), { ownerId: BOB }));
});

test("a student cannot edit someone else's project", async () => {
  await assertFails(updateDoc(doc(alice(), "projects", "b-pending"), { title: "hijack", status: "Draft" }));
});

test("a student can delete their own project but not others'", async () => {
  await assertSucceeds(deleteDoc(doc(alice(), "projects", "a-draft")));
  await assertFails(deleteDoc(doc(alice(), "projects", "b-pending")));
});

test("a suspended student cannot create or edit projects", async () => {
  await env.withSecurityRulesDisabled((ctx) =>
    updateDoc(doc(ctx.firestore(), "users", ALICE), { accountStatus: "suspended" })
  );
  await assertFails(setDoc(doc(alice(), "projects", "a-new"), project("a-new", ALICE)));
  await assertFails(updateDoc(doc(alice(), "projects", "a-draft"), { title: "x", status: "Draft" }));
});

// ── server-only collections ────────────────────────────────────────────

test("audit logs and settings are not readable or writable by clients", async () => {
  await assertFails(getDoc(doc(alice(), "auditLogs", "x")));
  await assertFails(setDoc(doc(alice(), "auditLogs", "y"), { action: "fake" }));
  await assertFails(getDoc(doc(anon(), "settings", "portal")));
  await assertFails(setDoc(doc(alice(), "settings", "portal"), { submissionsOpen: false }));
});

test("a student cannot write to an old legacy profile id", async () => {
  await env.withSecurityRulesDisabled((ctx) =>
    setDoc(doc(ctx.firestore(), "users", "google-legacy123"), profile("google-legacy123"))
  );
  await assertFails(updateDoc(doc(alice(), "users", "google-legacy123"), { bio: "mine now" }));
  await assertFails(getDoc(doc(alice(), "users", "google-legacy123")));
});

test("unknown collections are closed", async () => {
  await assertFails(setDoc(doc(alice(), "anything", "x"), { a: 1 }));
});
