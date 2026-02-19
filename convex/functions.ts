import { query, mutation, action } from './_generated/server'
import {
  customQuery,
  customMutation,
  customAction,
} from 'convex-helpers/server/customFunctions'
import { SessionIdArg } from 'convex-helpers/server/sessions'
import { Doc } from './_generated/dataModel'

export const queryWithSession = customQuery(query, {
  args: SessionIdArg,
  input: async (ctx, { sessionId }) => {
    const normalizedId = ctx.db.normalizeId('sessions', sessionId)
    const session = normalizedId ? await ctx.db.get(normalizedId) : null
    if (!session) {
      throw new Error(
        'Session must be initialized first. ' +
          'Are you wrapping your code with <SessionProvider>? ' +
          'Are you requiring a session from a query that executes immediately?'
      )
    }
    return { ctx: { session }, args: {} }
  },
})

export const mutationWithSession = customMutation(mutation, {
  args: SessionIdArg,
  input: async (ctx, { sessionId }) => {
    const normalizedId = ctx.db.normalizeId('sessions', sessionId)
    const session = normalizedId ? await ctx.db.get(normalizedId) : null
    if (!session) {
      throw new Error(
        'Session must be initialized first. ' +
          'Are you wrapping your code with <SessionProvider>? ' +
          'Are you requiring a session from a query that executes immediately?'
      )
    }
    return { ctx: { session }, args: {} }
  },
})

export const actionWithSession = customAction(action, {
  args: SessionIdArg,
  input: async (_ctx, { sessionId }) => {
    return { ctx: { sessionId }, args: {} }
  },
})
