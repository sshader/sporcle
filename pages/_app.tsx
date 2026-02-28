import '../styles/globals.css'
import type { AppProps } from 'next/app'

import { ConvexReactClient, useConvexAuth, useQuery } from 'convex/react'
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function useSessionId(): Id<'sessions'> | null {
  const { isAuthenticated } = useConvexAuth()
  const session = useQuery(api.sessions.get, isAuthenticated ? {} : "skip")
  return session?._id ?? null
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConvexAuthProvider client={convex}>
      <Component {...pageProps} />
    </ConvexAuthProvider>
  )
}
