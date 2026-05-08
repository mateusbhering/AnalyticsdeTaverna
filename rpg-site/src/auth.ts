import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const ADMIN_USERNAMES = ["mateusbhering", "juliacrws", "Tsunokaway", "oipimenta"];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const login = (profile as { login?: string })?.login ?? "";
      return ADMIN_USERNAMES.includes(login);
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
