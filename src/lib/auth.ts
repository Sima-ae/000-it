import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (
            process.env.NODE_ENV === "production" &&
            (!process.env.AUTH_SECRET ||
              process.env.AUTH_SECRET.includes("generate-with-openssl") ||
              process.env.AUTH_SECRET.includes("placeholder"))
          ) {
            console.error("AUTH_SECRET is missing or still a placeholder in production");
            return null;
          }

          const parsed = credentialsSchema.safeParse({
            email: typeof credentials?.email === "string" ? credentials.email.trim() : credentials?.email,
            password: credentials?.password,
          });
          if (!parsed.success) return null;

          const user = await prisma.user.findUnique({
            where: { email: parsed.data.email.toLowerCase() },
          });
          if (!user?.password) return null;

          const valid = await bcrypt.compare(parsed.data.password, user.password);
          if (!valid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          console.error("[auth] authorize failed", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
});
