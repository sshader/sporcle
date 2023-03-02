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
  }),
  sessions: defineTable({
    color: s.string(),
    name: s.string(),
  }),
})
