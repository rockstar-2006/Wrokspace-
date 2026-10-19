import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Updated NextAuth route handler with bypass for local clock skew
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
