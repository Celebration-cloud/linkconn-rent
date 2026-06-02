import CredentialsProvider from "next-auth/providers/credentials";

import { supabaseServer } from "./superbaseServer";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 1. Authenticate user with Supabase Auth
        const { data, error } = await supabaseServer.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !data?.user) return null;

        const authUser = data.user;

        // 2. Fetch metadata from public users table
        const { data: userMeta, error: metaError } = await supabaseServer
          .from("users")
          .select(
            "id, role, onboarded, verification_status, profile_pic, verified",
          )
          .eq("auth_id", authUser.id)
          .single();

        if (metaError || !userMeta) return null;

        return {
          id: userMeta.id,
          email: authUser.email,
          role: userMeta.role,
          onboarded: userMeta.onboarded,
          verification_status: userMeta.verification_status,
          image: userMeta.profile_pic,
          verified: userMeta.verified,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.onboarded = user.onboarded;
        token.verification_status = user.verification_status;
        token.image = user.image;
        token.verified = user.verified;
      }

      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        role: token.role,
        onboarded: token.onboarded,
        verification_status: token.verification_status,
        image: token.image,
        verified: token.verified,
      };

      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;

      return baseUrl;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
