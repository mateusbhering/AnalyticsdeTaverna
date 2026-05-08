import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const ADMIN_USERNAME = process.env.ADMIN_GITHUB_USERNAME ?? "mateusbhering";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      // Bloqueia qualquer login que não seja o admin
      return (profile as { login?: string })?.login === ADMIN_USERNAME;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          login: token.login as string,
        },
      };
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.login = (profile as { login?: string }).login;
      }
      return token;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
});
