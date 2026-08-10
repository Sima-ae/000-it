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
    // Locale prefix is added by next-intl / middleware redirects
    signIn: "/nl/login",
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
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        return token;
      }

      // Refresh identity claims from DB so sidebar name/role stay correct after
      // profile edits, and so older cookies without `role` get backfilled.
      const userId =
        typeof token.id === "string"
          ? token.id
          : typeof token.sub === "string"
            ? token.sub
            : null;
      const needsRefresh =
        trigger === "update" ||
        typeof token.role !== "string" ||
        typeof token.name !== "string";

      if (userId && needsRefresh) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, role: true, name: true, email: true, image: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.picture = dbUser.image;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        if (typeof token.name === "string") session.user.name = token.name;
        if (typeof token.email === "string") session.user.email = token.email;
        if (typeof token.picture === "string" || token.picture === null) {
          session.user.image = token.picture;
        }
      }
      return session;
    },
  },
});
