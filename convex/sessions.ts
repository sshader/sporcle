import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { mutationWithSession } from './functions'

export const create = mutation(async ({ db }) => {
  return db.insert('sessions', {
    name: 'User ' + Math.floor(Math.random() * 10000).toString(),
    color: '#' + Math.floor(Math.random() * 16777215).toString(16),
  })
})

export const get = query({
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
