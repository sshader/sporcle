import { mutation, query } from './_generated/server'
import { Doc, Id } from './_generated/dataModel'
import { mutationWithSession } from './sessions'
import { v } from 'convex/values'

export const getQuizzes = query({
  args: {
    paginationOpts: v.any(),
  },
  handler: async ({ db }, { paginationOpts }) => {
    return await db.query('quiz').order('desc').paginate(paginationOpts)
  },
})

export const startGame = mutationWithSession({
  args: {
    quizId: v.id('quiz'),
  },
  handler: async ({ db, session }, { quizId }) => {
    const quiz = (await db.get(quizId))!
    return await db.insert('game', {
      quiz: quiz._id,
      title: quiz.title,
      finished: false,
      answers: quiz.answers.map(() => null),
      players: new Set([session!._id.id]),
    })
  },
})

export const setPublic = mutation({
  args: {
    gameId: v.id('game'),
    isPublic: v.boolean(),
  },
  handler: async ({ db }, { gameId, isPublic }) => {
    await db.patch(gameId, {
      isPublic,
    })
  },
})

export const getPublicGames = query({
  args: { paginationOpts: v.any() },
  handler: async ({ db }, { paginationOpts }) => {
    return await db
      .query('game')
      .withIndex('by_finished_and_public', (q) =>
        q.eq('finished', false).eq('isPublic', true)
      )
      .order('desc')
      .paginate(paginationOpts)
  },
})

export const endGame = mutation({
  args: { gameId: v.id('game') },
  handler: async ({ db }, { gameId }) => {
    const game = (await db.get(gameId))!
    const quiz = (await db.get(game.quiz))!
    const finishSessionId = await db.insert('sessions', {
      color: '#cccccc',
      name: 'Revealed',
    })
    quiz.answers.forEach((validAnswers, index) => {
      if (game.answers[index] === null) {
        game.answers[index] = {
          answer: Array.from(validAnswers)[0],
          answeredBy: finishSessionId,
        }
      }
    })
    return await db.patch(gameId, {
      quiz: quiz._id,
      finished: true,
      answers: game.answers,
      players: game.players.add(finishSessionId.id),
    })
  },
})

export const getGame = query({
  args: { gameId: v.id('game') },
  handler: async ({ db }, { gameId }) => {
    const game = (await db.get(gameId))!
    const quiz = (await db.get(game.quiz))!
    const sessionIds = game.players
    const sessions: Doc<'sessions'>[] = await Promise.all(
      Array.from(sessionIds).map(async (sessionId) => {
        return (await db.get(new Id('sessions', sessionId)))!
      })
    )
    const sessionsMap = new Map()
    sessions.forEach((session) => {
      sessionsMap.set(session?._id.id, { session, score: 0 })
    })
    game.answers.forEach((value) => {
      const answeredBy = value?.answeredBy.id ?? null
      if (answeredBy !== null) {
        const current = sessionsMap.get(answeredBy)
        sessionsMap.set(answeredBy, {
          session: current.session,
          score: current.score + 1,
        })
      }
    })
    return {
      game,
      obfuscatedAnswers: quiz.obfuscatedAnswers,
      charMap: quiz.charMap,
      title: quiz.title,
      sporcleUrl: quiz.sporcleUrl,
      sessionsMap,
    }
  },
})

export const submitAnswer = mutationWithSession({
  args: { gameId: v.id('game'), answer: v.string() },
  handler: async ({ db, session }, { gameId, answer }) => {
    const game = (await db.get(gameId))!
    if (game.finished === true) {
      return false
    }

    game.players.add(session!._id.id)

    const quizId = game?.quiz
    const quiz = (await db.get(quizId))!

    let correct = false
    quiz.answers.forEach((validAnswers, index) => {
      if (validAnswers.has(answer) && game.answers[index] === null) {
        correct = true
        game.answers[index] = {
          answer,
          answeredBy: session!._id,
        }
      }
    })
    await db.patch(gameId, game)
    return correct
  },
})
