/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as actions_addSporcleQuiz from "../actions/addSporcleQuiz.js";
import type * as addSporcleQuiz from "../addSporcleQuiz.js";
import type * as game from "../game.js";
import type * as lib_middlewareUtils from "../lib/middlewareUtils.js";
import type * as lib_migrations from "../lib/migrations.js";
import type * as lib_withSession from "../lib/withSession.js";
import type * as migrateSets from "../migrateSets.js";
import type * as seed from "../seed.js";
import type * as sessions from "../sessions.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "actions/addSporcleQuiz": typeof actions_addSporcleQuiz;
  addSporcleQuiz: typeof addSporcleQuiz;
  game: typeof game;
  "lib/middlewareUtils": typeof lib_middlewareUtils;
  "lib/migrations": typeof lib_migrations;
  "lib/withSession": typeof lib_withSession;
  migrateSets: typeof migrateSets;
  seed: typeof seed;
  sessions: typeof sessions;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
