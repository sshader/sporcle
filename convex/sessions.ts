import { v } from 'convex/values'
import { query } from './_generated/server'
import { mutationWithSession, queryWithSession } from './functions'

export const get = queryWithSession({
  args: {},
  handler: async ({ session }) => {
    return session;
  },
})

export const getById = query({
  args: { sessionId: v.union(v.null(), v.string()) },
  handler: async ({ db }, { sessionId }) => {
    const normalizedId = sessionId
      ? db.normalizeId('sessions', sessionId)
      : null
    return normalizedId ? await db.get(normalizedId) : null
  },
})

export const update = mutationWithSession({
  args: { name: v.string(), color: v.string() },
  handler: async ({ db, session }, { name, color }) => {
    return await db.patch(session._id, {
      name,
      color,
    })
  },
})
