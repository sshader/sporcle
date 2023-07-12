import { Doc } from './_generated/dataModel'
import { MutationCtx } from './_generated/server'
import migrations from './lib/migrations'

export const gameMigration = migrations({
  table: 'game',
  migrateDoc: async (ctx: MutationCtx, game: Doc<'game'>) => {
    await ctx.db.patch(game._id, {
      players: Array.from(game.players),
    })
  },
})

export const quizMigration = migrations({
  table: 'quiz',
  migrateDoc: async (ctx: MutationCtx, quiz: Doc<'quiz'>) => {
    const answers = quiz.answers.map((a) => Array.from(a))
    const obfuscatedAnswers = Array.from(quiz.obfuscatedAnswers)
    await ctx.db.patch(quiz._id, {
      answers,
      obfuscatedAnswers,
    })
  },
})
