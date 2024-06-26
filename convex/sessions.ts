import { ObjectType, PropertyValidators, Validator, v } from 'convex/values'
import { Doc } from './_generated/dataModel'
import {
  DatabaseReader,
  MutationCtx,
  QueryCtx,
  mutation,
  query,
} from './_generated/server'
import {
  MergeArgsForRegistered,
  generateMiddlewareContextOnly,
} from './lib/middlewareUtils'
import {
  ArgsArray,
  RegisteredMutation,
  RegisteredQuery,
  UnvalidatedFunction,
  ValidatedFunction,
} from 'convex/server'

type NullToUndefinedOrNull<T> = T extends null ? T | undefined | void : T

export type ValidatorTypeToReturnType<T> =
  | Promise<NullToUndefinedOrNull<T>>
  | NullToUndefinedOrNull<T>

const sessionMiddlewareValidator = { sessionId: v.string() }
const transformContextForSession = async <Ctx>(
  ctx: Ctx & { db: DatabaseReader },
  args: { sessionId: string }
): Promise<Ctx & { session: Doc<'sessions'> }> => {
  const normaliedId = ctx.db.normalizeId('sessions', args.sessionId)
  const session = normaliedId ? await ctx.db.get(normaliedId) : null
  console.log('hello')
  if (!session) {
    throw new Error(
      'Session must be initialized first. ' +
        'Are you wrapping your code with <SessionProvider>? ' +
        'Are you requiring a session from a query that executes immediately?'
    )
  }
  return { ...ctx, session }
}

export const withSession = generateMiddlewareContextOnly<
  { db: DatabaseReader },
  { session: Doc<'sessions'> },
  typeof sessionMiddlewareValidator
>(sessionMiddlewareValidator, transformContextForSession)

/**
 * Wrapper for a Convex mutation function that provides a session in ctx.
 *
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
    Output
  >
): RegisteredMutation<
  'public',
  ObjectType<ArgsValidator> & ObjectType<typeof sessionMiddlewareValidator>,
  Output
>
export function mutationWithSession<Args extends ArgsArray, Output>(
  func: UnvalidatedFunction<
    MutationCtx & { session: Doc<'sessions'> },
    Args,
    Promise<Output>
  >
): RegisteredMutation<
  'public',
  MergeArgsForRegistered<Args, ObjectType<typeof sessionMiddlewareValidator>>,
  Output
>
export function mutationWithSession(func: any): any {
  return mutation(withSession(func))
}

/**
 * Wrapper for a Convex query function that provides a session in ctx.
 *
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
    QueryCtx & { session: Doc<'sessions'> },
    ArgsValidator,
    Promise<Output>
  >
): RegisteredQuery<
  'public',
  ObjectType<ArgsValidator> & ObjectType<typeof sessionMiddlewareValidator>,
  Output
>
export function queryWithSession<Args extends ArgsArray, Output>(
  func: UnvalidatedFunction<
    QueryCtx & { session: Doc<'sessions'> },
    Args,
    Promise<Output>
  >
): RegisteredQuery<
  'public',
  MergeArgsForRegistered<Args, ObjectType<typeof sessionMiddlewareValidator>>,
  Output
>
export function queryWithSession(func: any): any {
  return query(withSession(func))
}

export const create = mutation(async ({ db }) => {
  return db.insert('sessions', {
    name: 'User ' + Math.floor(Math.random() * 10000).toString(),
    color: '#' + Math.floor(Math.random() * 16777215).toString(16),
  })
})

export const get = query({
  args: { sessionId: v.union(v.null(), v.string()) },
  handler: async ({ db }, { sessionId }) => {
    const normalizedId = sessionId
      ? db.normalizeId('sessions', sessionId)
      : null
    return normalizedId ? await db.get(normalizedId) : null
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
