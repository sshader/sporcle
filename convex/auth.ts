import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Anonymous, Password],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { userId, existingUserId }) {
      if (existingUserId) return;
      // Create a linked session for new users
      await ctx.db.insert("sessions", {
        name: "User " + Math.floor(Math.random() * 10000).toString(),
        color: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"),
        userId,
      });
    },
  },
});
