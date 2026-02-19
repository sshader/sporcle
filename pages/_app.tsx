import '../styles/globals.css'
import type { AppProps } from 'next/app'

import { ConvexProvider, ConvexReactClient, useMutation, useQuery } from 'convex/react'
import { api } from '../convex/_generated/api';
import { useEffect } from 'react';
import { useLocalStorage } from 'usehooks-ts'
import { SessionId } from 'convex-helpers/server/sessions';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function useSessionId(): SessionId {
  const [sessionId] = useLocalStorage('sessionId', null)
  if (!sessionId) {
    throw new Error('Session ID is not set')
  }
  return sessionId as SessionId
}

function SessionWrapper({ children }: { children: React.ReactNode }) {
  const [sessionId] = useLocalStorage('sessionId', null)
  const session = useQuery(api.sessions.get, sessionId ? { sessionId } : 'skip')
  const createSession = useMutation(api.sessions.create)
  useEffect(() => {
    async function createSessionIfNeeded() {
      if (session === null || sessionId === null) {
        const newSessionId = await createSession()
        localStorage.setItem('sessionId', JSON.stringify(newSessionId))
      }
    }
    createSessionIfNeeded()
  }, [session, createSession, sessionId])
  if (session === undefined || session === null) {
    return <div>Loading...</div>
  }
  return <>{children}</>
}


export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConvexProvider client={convex}>
      <SessionWrapper>
        <Component {...pageProps} />
      </SessionWrapper>
    </ConvexProvider>
  )
}



