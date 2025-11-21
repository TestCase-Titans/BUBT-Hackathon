import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import { User, SuperAdmin } from "@/lib/models"; // [NEW] Import SuperAdmin
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();

        if (!credentials?.email || !credentials?.password) return null;

        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (passwordsMatch) {
          // [NEW] Check for Admin privileges
          const adminRecord = await SuperAdmin.findOne({ userId: user._id });

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            isAdmin: !!adminRecord, // [NEW] Add flag
          };
        }

        return null;
      },
    }),
  ],
});