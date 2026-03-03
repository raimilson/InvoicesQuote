import type { NextAuthConfig } from "next-auth";

// Edge-safe auth config (no Node.js-only modules like bcryptjs)
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) session.user.id = token.sub;
      if (token?.role) (session.user as any).role = token.role;
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
  },
  session: { strategy: "jwt" },
  providers: [], // providers added in auth.ts (Node.js only)
};
