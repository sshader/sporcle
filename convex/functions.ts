import { query, mutation } from './_generated/server'
import {
  customQuery,
  customMutation,
} from 'convex-helpers/server/customFunctions'
import { getAuthUserId } from "@convex-dev/auth/server";

export const queryWithSession = customQuery(query, {
  args: {},
  input: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .unique();
    if (!session) {
      throw new Error('Session not found for authenticated user');
    }
    return { ctx: { session }, args: {} };
  },
})

export const mutationWithSession = customMutation(mutation, {
  args: {},
  input: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .unique();
    if (!session) {
      throw new Error('Session not found for authenticated user');
    }
    return { ctx: { session }, args: {} };
  },
})
