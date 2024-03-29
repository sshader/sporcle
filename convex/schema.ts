import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  quiz: defineTable({
    answers: v.array(v.array(v.string())),
    title: v.string(),
    sporcleUrl: v.string(),
    obfuscatedAnswers: v.array(v.string()),
    // stringified JSON
    charMap: v.string(),
  }),
  game: defineTable({
    quiz: v.id('quiz'),
    title: v.optional(v.string()),
    answers: v.array(
      v.union(
        v.object({
          answer: v.string(),
          answeredBy: v.id('sessions'),
        }),
        v.null()
      )
    ),
    players: v.array(v.string()),
    finished: v.optional(v.boolean()),
    isPublic: v.optional(v.boolean()),
  }).index('by_finished_and_public', ['finished', 'isPublic']),
  sessions: defineTable({
    color: v.string(),
    name: v.string(),
  }),
})
