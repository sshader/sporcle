/**
 * Allows you to persist state server-side, associated with a sessionId stored
 * on the client (in localStorage, e.g.). You wrap your mutation / query with
 * withSession or withOptionalSession and it passes in "session" in the "ctx"
 * (first parameter) argument to your function. withOptionalSession allows
 * the sessionId to be null or invalid, and passes in `session: null` if so.
 */
import {
  RegisteredMutation,
  RegisteredQuery,
  UnvalidatedFunction,
  ValidatedFunction,
} from 'convex/server'
import { Doc, Id } from './_generated/dataModel'
import { mutation, MutationCtx, query, QueryCtx } from './_generated/server'
import {
  // TODO: import these once they're exported
  /*ObjectType, PropertyValidators,*/ v,
  Validator,
} from 'convex/values'

const sessionIdValidator = v.id('sessions')
const optionalSessionIdValidator = v.union(v.id('sessions'), v.null())

/**
 * Wrapper for a Convex query or mutation function that provides a session in ctx.
 *
 * The session will be `null` if the sessionId passed up was null or invalid.
 * Requires `sessionId` (type: Id<"sessions">) as a parameter.
 * This is provided by * default by using {@link useSessionQuery} or {@link useSessionMutation}.
 * Pass this to `query`, `mutation`, or another wrapper. E.g.:
 * ```ts
 * export default mutation(withOptionalSession({
 *   args: { arg1: ... },
 *   handler: async ({ db, auth, session }, { arg1 }) => {...}
 * }));
 * ```
 * @param func - Your function that can take in a `session` in the first (ctx) param.
 * @returns A function to be passed to `query` or `mutation`.
 */
export function withOptionalSession<
  Ctx extends QueryCtx,
  ArgsValidator extends PropertyValidators,
  Output
>(
  fn: ValidatedFunction<
    Ctx & { session: Doc<'sessions'> | null },
    ArgsValidator,
    Promise<Output>
  >
): ValidatedFunction<
  Ctx,
  ArgsValidator & { sessionId: typeof optionalSessionIdValidator },
  Promise<Output>
>
export function withOptionalSession<Ctx extends QueryCtx, Output>(
  fn: UnvalidatedFunction<
    Ctx & { session: Doc<'sessions'> | null },
    [],
    Promise<Output>
  >
): ValidatedFunction<
  Ctx,
  { sessionId: typeof optionalSessionIdValidator },
  Promise<Output>
>
export function withOptionalSession(fn: any) {
  const handler = fn.handler ?? fn
  const args = fn.args ?? {}
  return {
    args: {
      ...args,
      sessionId: optionalSessionIdValidator,
    },
    handler: async (ctx: any, allArgs: any) => {
      const { sessionId, ...args } = allArgs
      const session = sessionId ? await ctx.db.get(sessionId) : null
      return handler({ ...ctx, session }, args)
    },
  }
}

/**
 * Wrapper for a Convex query or mutation function that provides a session in ctx.
 *
 * Throws an exception if there isn't a valid session.
 * Requires `sessionId` (type: Id<"sessions">) as a parameter.
 * This is provided by * default by using {@link useSessionQuery} or {@link useSessionMutation}.
 * Pass this to `query`, `mutation`, or another wrapper. E.g.:
 * ```ts
 * export default mutation(withSession({
 *   args: { arg1: ... },
 *   handler: async ({ db, auth, session }, { arg1 }) => {...}
 * }));
 * ```
 * @param func - Your function that can take in a `session` in the first (ctx) param.
 * @returns A function to be passed to `query` or `mutation`.
 */
export function withSession<
  Ctx extends QueryCtx,
  ArgsValidator extends PropertyValidators,
  Output
>(
  fn: ValidatedFunction<
    Ctx & { session: Doc<'sessions'> },
    ArgsValidator,
    Promise<Output>
  >
): ValidatedFunction<
  Ctx,
  ArgsValidator & { sessionId: typeof sessionIdValidator },
  Promise<Output>
>
export function withSession<Ctx extends QueryCtx, Output>(
  fn: UnvalidatedFunction<
    Ctx & { session: Doc<'sessions'> },
    [],
    Promise<Output>
  >
): ValidatedFunction<
  Ctx,
  { sessionId: typeof sessionIdValidator },
  Promise<Output>
>
export function withSession(fn: any) {
  const handler = fn.handler ?? fn
  const args = fn.args ?? {}
  return {
    args: {
      ...args,
      sessionId: sessionIdValidator,
    },
    handler: async (ctx: any, allArgs: any) => {
      const { sessionId, ...args } = allArgs
      const session = sessionId ? await ctx.db.get(sessionId) : null
      if (!session) {
        throw new Error(
          'Session must be initialized first. ' +
            'Are you wrapping your code with <SessionProvider>? ' +
            'Are you requiring a session from a query that executes immediately?'
        )
      }
      return handler({ ...ctx, session }, args)
    },
  }
}

/**
 * Wrapper for a Convex mutation function that provides a session in ctx.
 *
 * Requires an `Id<"sessions">` as the first parameter. This is provided by
 * default by using {@link useSessionMutation}.
 * E.g.:
 * ```ts
 * export default mutationWithSession({
 *   args: { arg1: v.any() },
 *   handler: async ({ db, auth, session }, { arg1 }) => {...}
 * });
 * ```
 * @param func - Your function that can now take in a `session` in the ctx param.
 * @returns A Convex serverless function.
 */
export function mutationWithSession<
  ArgsValidator extends PropertyValidators,
  Output
>(
  func: ValidatedFunction<
    MutationCtx & { session: Doc<'sessions'> },
    ArgsValidator,
    Promise<Output>
  >
): RegisteredMutation<
  'public',
  [ObjectType<ArgsValidator> & { sessionId: Id<'sessions'> }],
  Output
>
export function mutationWithSession<Output>(
  func: UnvalidatedFunction<
    MutationCtx & { session: Doc<'sessions'> },
    [],
    Promise<Output>
  >
): RegisteredMutation<'public', [{ sessionId: Id<'sessions'> }], Output>
export function mutationWithSession(func: any): any {
  return mutation(withSession(func))
}

/**
 * Wrapper for a Convex query function that provides a session in ctx.
 *
 * Requires an `Id<"sessions">` as the first parameter. This is provided by
 * default by using {@link useSessionQuery}. It validates and strips this
 * parameter for you.
 * E.g.:
 * ```ts
 * export default queryWithSession({
 *   args: { arg1: v.any() },
 *   handler: async ({ db, auth, session }, { arg1 }) => {...}
 * });
 * ```
 * If the session isn't initialized yet, it will pass null.
 * @param func - Your function that can now take in a `session` in the ctx param.
 * @returns A Convex serverless function.
 */
export function queryWithSession<
  ArgsValidator extends PropertyValidators,
  Output
>(
  func: ValidatedFunction<
    QueryCtx & { session: Doc<'sessions'> | null },
    ArgsValidator,
    Promise<Output>
  >
): RegisteredQuery<
  'public',
  [ObjectType<ArgsValidator> & { sessionId: Id<'sessions'> | null }],
  Output
>
export function queryWithSession<Output>(
  func: UnvalidatedFunction<
    QueryCtx & { session: Doc<'sessions'> | null },
    [],
    Promise<Output>
  >
): RegisteredQuery<'public', [{ sessionId: Id<'sessions'> | null }], Output>
export function queryWithSession(func: any): any {
  return query(withOptionalSession(func))
}

export const create = mutation(async ({ db }) => {
  return db.insert('sessions', {
    name: 'User ' + Math.floor(Math.random() * 10000).toString(),
    color: '#' + Math.floor(Math.random() * 16777215).toString(16),
  })
})

export const get = query({
  args: { sessionId: v.union(v.null(), v.id('sessions')) },
  handler: async ({ db }, { sessionId }) => {
    return sessionId ? await db.get(sessionId) : null
  },
})

export const update = mutationWithSession({
  args: { name: v.string(), color: v.string() },
  handler: async ({ db, session }, { name, color }) => {
    return await db.patch(session._id, {
      name,
      color,
    })
  },
})

// XXX These should be exported from the npm package
type PropertyValidators = Record<string, Validator<any, any, any>>
declare type Expand<ObjectType extends Record<any, any>> =
  ObjectType extends Record<any, any>
    ? {
        [Key in keyof ObjectType]: ObjectType[Key]
      }
    : never
declare type OptionalKeys<
  PropertyValidators extends Record<string, Validator<any, any, any>>
> = {
  [Property in keyof PropertyValidators]: PropertyValidators[Property]['isOptional'] extends true
    ? Property
    : never
}[keyof PropertyValidators]
declare type RequiredKeys<
  PropertyValidators extends Record<string, Validator<any, any, any>>
> = Exclude<keyof PropertyValidators, OptionalKeys<PropertyValidators>>
declare type ObjectType<Validators extends PropertyValidators> = Expand<
  {
    [Property in OptionalKeys<Validators>]?: Validators[Property]['type']
  } & {
    [Property in RequiredKeys<Validators>]: Validators[Property]['type']
  }
>
