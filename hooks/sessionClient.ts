import { api } from '../convex/_generated/api'
import { useQuery, useMutation, useConvex } from 'convex/react'
/**
 * React helpers for adding session data to Convex functions.
 *
 * !Important!: To use these functions, you must wrap your code with
 * ```tsx
 *  <ConvexProvider client={convex}>
 *    <SessionProvider storageLocation={"sessionStorage"}>
 *      <App />
 *    </SessionProvider>
 *  </ConvexProvider>
 * ```
 *
 * With the `SessionProvider` inside the `ConvexProvider` but outside your app.
 */
import React, { useContext, useEffect, useState } from 'react'
import { Id } from '../convex/_generated/dataModel'
import { FunctionReference, OptionalRestArgs } from 'convex/server'

const StoreKey = 'ConvexSessionId'

export const SessionContext = React.createContext<string | null>(null)

/**
 * Context for a Convex session, creating a server session and providing the id.
 *
 * @param props - Where you want your session ID to be persisted. Roughly:
 *  - sessionStorage is saved per-tab
 *  - localStorage is shared between tabs, but not browser profiles.
 * @returns A provider to wrap your React nodes which provides the session ID.
 * To be used with useSessionQuery and useSessionMutation.
 */
export const SessionProvider: React.FC<{
  storageLocation?: 'localStorage' | 'sessionStorage'
  children?: React.ReactNode
}> = ({ storageLocation, children }) => {
  const store =
    // If it's rendering in SSR or such.
    typeof window === 'undefined'
      ? null
      : window[storageLocation ?? 'sessionStorage']
  const convex = useConvex()
  const [sessionId, setSession] = useState<string | null>(() => {
    const stored = store?.getItem(StoreKey)
    if (stored) {
      return stored
    }
    return null
  })
  const createSession = useMutation(api.sessions.create)

  // Get or set the ID from our desired storage location, whenever it changes.
  useEffect(() => {
    if (sessionId) {
      void (async () => {
        const session = await convex.query(api.sessions.get, { sessionId })
        setSession(session!._id)
        store?.setItem(StoreKey, session!._id)
      })()
    } else {
      void (async () => {
        setSession(await createSession())
      })()
    }
  }, [sessionId, createSession, store])

  return React.createElement(
    SessionContext.Provider,
    { value: sessionId },
    children
  )
}

type EmptyObject = Record<string, never>

/**
 * An `Omit<>` type that:
 * 1. Applies to each element of a union.
 * 2. Preserves the index signature of the underlying type.
 */
declare type BetterOmit<T, K extends keyof T> = {
  [Property in keyof T as Property extends K ? never : Property]: T[Property]
}

type SessionFunction<Args extends any> = FunctionReference<
  'query' | 'mutation',
  'public',
  { sessionId: string } & Args,
  any
>

type SessionFunctionArgs<Fn extends SessionFunction<any>> =
  keyof Fn['_args'] extends 'sessionId'
    ? EmptyObject
    : BetterOmit<Fn['_args'], 'sessionId'>

// Like useQuery, but for a Query that takes a session ID.
export function useSessionQuery<
  Query extends FunctionReference<
    'query',
    'public',
    { sessionId: Id<'sessions'> },
    any
  >
>(
  query: SessionFunctionArgs<Query> extends EmptyObject ? Query : never
): Query['_returnType'] | undefined
export function useSessionQuery<
  Query extends FunctionReference<'query', 'public', { sessionId: string }, any>
>(
  query: Query,
  args: SessionFunctionArgs<Query>
): Query['_returnType'] | undefined
export function useSessionQuery<
  Query extends FunctionReference<'query', 'public', { sessionId: string }, any>
>(
  query: Query,
  args?: SessionFunctionArgs<Query>
): Query['_returnType'] | undefined {
  const sessionId = useContext(SessionContext)

  const newArgs = { ...args, sessionId }

  return useQuery(query, ...([newArgs] as OptionalRestArgs<Query>))
}

// Like useMutation, but for a Mutation that takes a session ID.
export const useSessionMutation = <
  Mutation extends FunctionReference<
    'mutation',
    'public',
    { sessionId: string },
    any
  >
>(
  name: Mutation
) => {
  const sessionId = useContext(SessionContext)
  const originalMutation = useMutation(name)

  return (
    args: SessionFunctionArgs<Mutation>
  ): Promise<Mutation['_returnType']> => {
    const newArgs = { ...args, sessionId } as Mutation['_args']

    return originalMutation(...([newArgs] as OptionalRestArgs<Mutation>))
  }
}
