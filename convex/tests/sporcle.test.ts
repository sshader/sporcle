
import { api, internal } from "../_generated/api";
import { convexTest, TestConvex } from "convex-test";
import { describe, expect, test, beforeEach } from "vitest";
import schema from "../schema";

describe("sporcle", () => {
  let t: TestConvex<typeof schema>;

  beforeEach(async () => {
    t = convexTest(schema)
    await t.withIdentity({}).mutation(internal.seed.default, {})
  });

  test("join game", async () => {
    const sessionA = await t.mutation(api.sessions.create, {})

    const gamesResult = await t.query(api.game.getPublicGames, { paginationOpts: { numItems: 10, cursor: null } });
    const games = gamesResult.page;
    expect(games.length).toStrictEqual(1);
    const game = games[0];
    expect(game.players.length).toStrictEqual(1)
    expect(game.players.includes(sessionA)).toStrictEqual(false)
    await t.mutation(api.game.submitAnswer, { gameId: game._id, sessionId: sessionA, answer: "Lavender Haze" })

    const { game: updatedGame, sessionsMap } = await t.query(api.game.getGame, { gameId: game._id })
    expect(updatedGame.players.length).toStrictEqual(2);
    expect(updatedGame.players.includes(sessionA)).toStrictEqual(true)
    expect(sessionsMap[sessionA].score).toStrictEqual(1)
  });
});