import { DatabaseWriter, mutation, query } from './_generated/server'
import { Doc, Id } from './_generated/dataModel'
import { mutationWithSession } from './functions'
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
    return startGameHelper(db, session, quizId)
  },
})

export const startGameHelper = async (
  db: DatabaseWriter,
  session: Doc<'sessions'>,
  quizId: Id<'quiz'>
) => {
  const quiz = (await db.get(quizId))!
  const now = Date.now()
  return await db.insert('game', {
    quiz: quiz._id,
    title: quiz.title,
    finished: false,
    isPublic: true,
    lastActiveTime: now,
    answers: quiz.answers.map(() => null),
    players: [session!._id],
  })
}

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
    const result = await db
      .query('game')
      .withIndex('by_finished_and_public', (q) =>
        q.eq('finished', false).eq('isPublic', true)
      )
      .order('desc')
      .paginate(paginationOpts)

    const pagesWithPlayers = await Promise.all(
      result.page.map(async (game) => {
        const playerSessions = await Promise.all(
          game.players.slice(0, 5).map(async (playerId) => {
            const normalizedId = db.normalizeId('sessions', playerId)
            return normalizedId ? await db.get(normalizedId) : null
          })
        )
        return {
          ...game,
          playerSessions: playerSessions.filter(
            (s): s is Doc<'sessions'> => s !== null
          ),
        }
      })
    )

    return {
      ...result,
      page: pagesWithPlayers,
    }
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
    const players = new Set(game.players)
    players.add(finishSessionId)
    return await db.patch(gameId, {
      quiz: quiz._id,
      finished: true,
      answers: game.answers,
      players: Array.from(players),
    })
  },
})

export const getGame = query({
  args: { gameId: v.string() },
  handler: async ({ db }, { gameId }) => {
    const normalizedId = db.normalizeId('game', gameId)!
    const game = (await db.get(normalizedId))!
    const quiz = (await db.get(game.quiz))!
    const sessionIds = game.players
    const sessions: Doc<'sessions'>[] = await Promise.all(
      Array.from(sessionIds).map(async (sessionId) => {
        return (await db.get(db.normalizeId('sessions', sessionId)!))!
      })
    )
    const sessionsMap: Record<
      string,
      { session: Doc<'sessions'>; score: number }
    > = {}
    sessions.forEach((session) => {
      sessionsMap[session?._id] = { session, score: 0 }
    })
    game.answers.forEach((value) => {
      const answeredBy = value?.answeredBy ?? null
      if (answeredBy !== null) {
        const current = sessionsMap[answeredBy]
        sessionsMap[answeredBy] = {
          session: current.session,
          score: current.score + 1,
        }
      }
    })
    return {
      game,
      obfuscatedAnswers: quiz.obfuscatedAnswers ?? [],
      charMap: quiz.charMap ?? null,
      title: quiz.title,
      sporcleUrl: quiz.sporcleUrl ?? null,
      sessionsMap,
    }
  },
})

export const submitAnswerHelper = async (
  db: DatabaseWriter,
  session: Doc<'sessions'>,
  gameId: Id<'game'>,
  answer: string
) => {
  const game = (await db.get(gameId))!
  if (game.finished === true) {
    return false
  }

  const players = new Set(game.players)
  players.add(session!._id)
  game.players = Array.from(players)

  const quizId = game?.quiz
  const quiz = (await db.get(quizId))!

  let correct = false
  quiz.answers.forEach((validAnswers, index) => {
    if (validAnswers.indexOf(answer) !== -1 && game.answers[index] === null) {
      correct = true
      game.answers[index] = {
        answer,
        answeredBy: session!._id,
      }
    }
  })
  await db.patch(gameId, {
    ...game,
    lastActiveTime: Date.now(),
  })
  return correct
}

export const submitAnswer = mutationWithSession({
  args: { gameId: v.id('game'), answer: v.string() },
  handler: async ({ db, session }, { gameId, answer }) => {
    return submitAnswerHelper(db, session, gameId, answer)
  },
})

export const createQuiz = mutation({
  args: {
    title: v.string(),
    answers: v.array(v.array(v.string())),
  },
  handler: async ({ db }, { title, answers }) => {
    return await db.insert('quiz', {
      title,
      answers,
    })
  },
})
