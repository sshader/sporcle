
import { api, internal } from "../_generated/api";
import { convexTest, TestConvex } from "convex-test";
import { describe, expect, test, beforeEach } from "vitest";
import schema from "../schema";
import { modules } from "../test.setup";

describe("sporcle", () => {
  let t: TestConvex<typeof schema>;

  beforeEach(async () => {
    t = convexTest(schema, modules)
    await t.mutation(internal.seed.default, {})
  });

  test("join game", async () => {
    // Create a session directly in the DB (simulating what auth callback does)
    const sessionA = await t.run(async (ctx) => {
      return ctx.db.insert("sessions", {
        name: "Test User",
        color: "#ff0000",
      });
    });

    const gamesResult = await t.query(api.game.getPublicGames, { paginationOpts: { numItems: 10, cursor: null } });
    const games = gamesResult.page;
    expect(games.length).toStrictEqual(1);
    const game = games[0];
    expect(game.players.length).toStrictEqual(1)
    expect(game.players.includes(sessionA)).toStrictEqual(false)

    // Use the helper directly since submitAnswer now requires auth
    const { submitAnswerHelper } = await import("../game");
    await t.run(async (ctx) => {
      const session = (await ctx.db.get(sessionA))!;
      await submitAnswerHelper(ctx.db, session, game._id, "Lavender Haze");
    });

    const { game: updatedGame, sessionsMap } = await t.query(api.game.getGame, { gameId: game._id })
    expect(updatedGame.players.length).toStrictEqual(2);
    expect(updatedGame.players.includes(sessionA)).toStrictEqual(true)
    expect(sessionsMap[sessionA].score).toStrictEqual(1)
  });
});
