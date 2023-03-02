import { defineSchema, defineTable, s } from 'convex/schema'

export default defineSchema({
  quiz: defineTable({
    answers: s.array(s.set(s.string())),
    title: s.string(),
    sporcleUrl: s.string(),
    obfuscatedAnswers: s.set(s.string()),
    // stringified JSON
    charMap: s.string(),
  }),
  game: defineTable({
    quiz: s.id('quiz'),
    title: s.optional(s.string()),
    answers: s.array(
      s.union(
        s.object({
          answer: s.string(),
          answeredBy: s.id('sessions'),
        }),
        s.null()
      )
    ),
    players: s.set(s.string()),
    finished: s.optional(s.boolean()),
    isPublic: s.optional(s.boolean()),
  }).index('by_finished_and_public', ['finished', 'isPublic']),
  sessions: defineTable({
    color: s.string(),
    name: s.string(),
  }),
})
