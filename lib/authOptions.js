import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
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
        const { data: user, error } = await supabaseServer
          .from("users")
          .select("*")
          .eq("email", credentials.email)
          .single();

        if (error || !user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) return null;

        const { data: roleData } = await supabaseServer
          .from(`${user.role}s`)
          .select("full_name, address")
          .eq("id", user.ref_id)
          .maybeSingle();

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name: roleData?.full_name,
          address: roleData?.address,
          image: user.profile_pic,
          onboarded: user.onboarded,
          verification_status: user.verification_status,
          verified: user.verified,
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
        token.name = user.name;
        token.role = user.role;
        token.onboarded = user.onboarded;
        token.verification_status = user.verification_status;
        token.image = user.image;
        token.address = user.address;
        token.verified = user.verified;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        name: token.name,
        role: token.role,
        onboarded: token.onboarded,
        verification_status: token.verification_status,
        image: token.image,
        address: token.address,
        verified: token.verified,
      };
      return session;
    },

    async redirect({ baseUrl, token }) {
      const role = token?.role;
      const onboarded = token?.onboarded;
      const status = token?.verification_status;

      if (!role) return `${baseUrl}/`;

      // Handle onboarding
      if (!onboarded) return `${baseUrl}/onboarding/${role}`;

      // Handle verification
      if (status === "pending") return `${baseUrl}/pending/${role}`;
      if (status === "rejected") return `${baseUrl}/rejected/${role}`;

      // Only verified users reach dashboard
      return `${baseUrl}/dashboard/${role}`;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
