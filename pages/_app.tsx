import '../styles/globals.css'
import type { AppProps } from 'next/app'

import { ConvexProvider, ConvexReactClient, useQuery } from 'convex/react'
import { SessionProvider } from '../hooks/sessionClient'
import { api } from '../convex/_generated/api'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

function fallbackRender({ error }: FallbackProps) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{error.message}</pre>
    </div>
  )
}

// Ensure this UI is talking to the correct backend
// Wrap any part of the app that talks to Convex in this (e.g. right below the ConvexProvider)
function CheckDeploymentInfo({ children }: { children: React.ReactNode }) {
  const check = useQuery(api.checkInfo.default, {
    identifier: process.env.NEXT_PUBLIC_DEPLOYMENT_IDENTIFIER ?? '',
    hash: process.env.NEXT_PUBLIC_DEPLOYMENT_HASH ?? '',
  })
  if (check?.error) {
    throw new Error(check.error)
  }
  return <>{children}</>
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ConvexProvider client={convex}>
      <ErrorBoundary fallbackRender={fallbackRender}>
        <CheckDeploymentInfo>
          <SessionProvider storageLocation={'localStorage'}>
            <Component {...pageProps} />
          </SessionProvider>
        </CheckDeploymentInfo>
      </ErrorBoundary>
    </ConvexProvider>
  )
}

export default MyApp
