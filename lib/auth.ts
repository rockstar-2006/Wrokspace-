import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { isAdminEmail } from "@/lib/admin/adminEmails";

export const authOptions: NextAuthOptions = {
  providers: [
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
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    // NextAuth is only used for the Host/admin panel: sign in again every 12 hours
    maxAge: 12 * 60 * 60,
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        // Re-evaluated on every request so removing an email from ADMIN_EMAILS revokes access immediately
        (session.user as any).isAdmin = isAdminEmail(token.email as string | undefined);
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id || token.sub;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
