/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_addSporcleQuiz from "../actions/addSporcleQuiz.js";
import type * as actions_checkQuiz from "../actions/checkQuiz.js";
import type * as actions_generateQuiz from "../actions/generateQuiz.js";
import type * as addSporcleQuiz from "../addSporcleQuiz.js";
import type * as functions from "../functions.js";
import type * as game from "../game.js";
import type * as lib_migrations from "../lib/migrations.js";
import type * as migrateSets from "../migrateSets.js";
import type * as seed from "../seed.js";
import type * as sessions from "../sessions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/addSporcleQuiz": typeof actions_addSporcleQuiz;
  "actions/checkQuiz": typeof actions_checkQuiz;
  "actions/generateQuiz": typeof actions_generateQuiz;
  addSporcleQuiz: typeof addSporcleQuiz;
  functions: typeof functions;
  game: typeof game;
  "lib/migrations": typeof lib_migrations;
  migrateSets: typeof migrateSets;
  seed: typeof seed;
  sessions: typeof sessions;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
