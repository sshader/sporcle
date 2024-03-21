import { api, internal } from "./convex/_generated/api";
import { ConvexTestingHelper } from "convex-helpers/testing";

describe("sporcle", () => {
  let t: ConvexTestingHelper;

  beforeEach(async () => {
    t = new ConvexTestingHelper({ adminKey: process.env.CONVEX_ADMIN_KEY, backendUrl: process.env.CONVEX_URL });
    // Calling an internal function is allowed since we have admin auth
    await t.withIdentity(t.newIdentity({})).mutation(internal.seed.default as any, {})
  });

  afterEach(async () => {
    await t.mutation(api.testing.clearAll, {});
    await t.close();
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