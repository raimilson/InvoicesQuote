import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Credentials from "next-auth/providers/credentials";

const allowedEmails = (process.env.ALLOWED_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const isAzureConfigured =
  process.env.AZURE_AD_CLIENT_ID &&
  process.env.AZURE_AD_CLIENT_ID !== "your-azure-app-client-id" &&
  process.env.AZURE_AD_CLIENT_SECRET &&
  process.env.AZURE_AD_CLIENT_SECRET !== "your-azure-app-client-secret";

const providers = [];

if (isAzureConfigured) {
  providers.push(
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      issuer: process.env.AZURE_AD_TENANT_ID
        ? `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`
        : undefined,
    })
  );
}

// Dev-only credentials provider (only active when Azure AD is not configured)
if (!isAzureConfigured && process.env.NODE_ENV !== "production") {
  providers.push(
    Credentials({
      id: "dev-login",
      name: "Dev Login",
      credentials: {},
      async authorize() {
        return {
          id: "dev-user",
          name: "Dev User",
          email: process.env.ALLOWED_EMAILS?.split(",")[0]?.trim() ?? "dev@kezpo.ca",
        };
      },
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      // If no allowed emails configured, allow all (dev mode)
      if (allowedEmails.length === 0) return true;
      const email = user.email?.toLowerCase() ?? "";
      return allowedEmails.includes(email);
    },
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  session: { strategy: "jwt" },
});
