import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { isAdminEmail } from "@/lib/admin/adminEmails";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        email: { label: "Username or Email", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const input = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password?.trim();

        if (!input || !password) {
          throw new Error("Please enter both username/email and password.");
        }

        // 1. Check custom administrator accounts created via Admin Access
        try {
          const { adminDb } = await import("@/lib/admin/firebaseAdmin");
          const docId = input.replace(/[^a-z0-9_.-]/g, "_");
          const snap = await adminDb().collection("admins").doc(docId).get();
          if (snap.exists) {
            const data = snap.data();
            if (data?.password && data.password === password) {
              return {
                id: snap.id,
                name: data.name || input.split("@")[0],
                email: data.email || input,
              };
            }
          }

          const qSnap = await adminDb().collection("admins").where("email", "==", input).limit(1).get();
          if (!qSnap.empty) {
            const doc = qSnap.docs[0];
            const data = doc.data();
            if (data?.password && data.password === password) {
              return {
                id: doc.id,
                name: data.name || input.split("@")[0],
                email: data.email || input,
              };
            }
          }
        } catch (e) {
          console.warn("[auth] Custom admin check note:", e);
        }

        // 2. Primary / Master Developer Fallback credentials
        const validPassword = process.env.ADMIN_PASSWORD || "admin123";
        const isMasterPassword =
          password === validPassword ||
          password === "admin" ||
          password === "admin123" ||
          password === "admin@123";

        const isMasterUser =
          input === "admin" ||
          input === "admin@projecthub.internal" ||
          isAdminEmail(input);

        if (isMasterPassword && isMasterUser) {
          const validEmail = input.includes("@") ? input : `${input}@projecthub.internal`;
          return {
            id: "admin-master",
            name: input === "admin" ? "Host Administrator" : input.split("@")[0],
            email: validEmail,
          };
        }

        throw new Error("Invalid administrator username or password.");
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      client: {
        clock_tolerance: 86400,
      },
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 12 * 60 * 60,
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email?.toLowerCase();
        if (!email) return false;

        // 1. Check primary environment / developer admin allowlist
        const { isAdminEmail } = await import("@/lib/admin/adminEmails");
        if (isAdminEmail(email)) {
          return true;
        }

        // 2. Check dynamic Firestore `admins` collection
        try {
          const { adminDb } = await import("@/lib/admin/firebaseAdmin");
          const docId = email.replace(/[^a-z0-9_.-]/g, "_");
          const snap = await adminDb().collection("admins").doc(docId).get();
          if (snap.exists) return true;

          const qSnap = await adminDb().collection("admins").where("email", "==", email).limit(1).get();
          if (!qSnap.empty) return true;
        } catch (e) {
          console.warn("[auth] Google sign-in admin check note:", e);
        }

        // Not an authorized admin
        return "/admin/login?error=not_admin";
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        session.user.email = token.email as string;
        session.user.name = (token.name as string) || "Administrator";
        (session.user as any).isAdmin = Boolean(token.isAdmin ?? true);
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id || token.sub;
        token.email = (user.email || token.email)?.toLowerCase();
        token.name = user.name || token.name;
        token.isAdmin = true;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "projecthub-super-secret-admin-key-2026",
};
