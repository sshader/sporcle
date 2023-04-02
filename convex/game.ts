import { mutation, query } from './_generated/server';
import { PaginationOptions } from 'convex/server';
import { Doc, Id } from './_generated/dataModel';
import { mutationWithSession } from './sessions';

export const getQuizzes = query(
  async ({ db }, paginationOpts: PaginationOptions) => {
    return await db.query('quiz').order('desc').paginate(paginationOpts);
  }
);

export const startGame = mutationWithSession(
  async ({ db, session }, quizId: Id<'quiz'>) => {
    const quiz = (await db.get(quizId))!;
    return await db.insert('game', {
      quiz: quiz._id,
      title: quiz.title,
      finished: false,
      answers: quiz.answers.map(() => null),
      players: new Set([session!._id.id]),
    });
  }
);

export const setPublic = mutation(
  async ({ db }, gameId: Id<'game'>, isPublic: boolean) => {
    await db.patch(gameId, {
      isPublic,
    });
  }
);

export const getPublicGames = query(
  async ({ db }, paginationOpts: PaginationOptions) => {
    return await db
      .query('game')
      .withIndex('by_finished_and_public', (q) =>
        q.eq('finished', false).eq('isPublic', true)
      )
      .order('desc')
      .paginate(paginationOpts);
  }
);

export const endGame = mutation(async ({ db }, gameId: Id<'game'>) => {
  const game = (await db.get(gameId))!;
  const quiz = (await db.get(game.quiz))!;
  const finishSessionId = await db.insert('sessions', {
    color: '#ffffff',
    name: 'Revealed',
  });
  quiz.answers.forEach((validAnswers, index) => {
    if (game.answers[index] === null) {
      game.answers[index] = {
        answer: Array.from(validAnswers)[0],
        answeredBy: finishSessionId,
      };
    }
  });
  return await db.patch(gameId, {
    quiz: quiz._id,
    finished: true,
    answers: game.answers,
  });
});

export const getGame = query(async ({ db }, gameId: Id<'game'>) => {
  const game = (await db.get(gameId))!;
  const quiz = (await db.get(game.quiz))!;
  const sessionIds = game.players;
  const sessions = await Promise.all(
    Array.from(sessionIds).map((sessionId) =>
      db.get(new Id('sessions', sessionId))
    )
  );
  const sessionsMap = new Map();
  sessions.forEach((session) => {
    sessionsMap.set(session?._id.id, session);
  });
  return {
    game,
    obfuscatedAnswers: quiz.obfuscatedAnswers,
    charMap: quiz.charMap,
    sessionsMap,
  };
});

export const submitAnswer = mutationWithSession(
  async ({ db, session }, gameId: Id<'game'>, answer: string) => {
    const game = (await db.get(gameId))!;
    if (game.finished === true) {
      return false;
    }

    game.players.add(session!._id.id);

    const quizId = game?.quiz;
    const quiz = (await db.get(quizId))!;

    let correct = false;
    quiz.answers.forEach((validAnswers, index) => {
      if (validAnswers.has(answer) && game.answers[index] === null) {
        correct = true;
        game.answers[index] = {
          answer,
          answeredBy: session!._id,
        };
      }
    });
    await db.patch(gameId, game);
    return correct;
  }
);
