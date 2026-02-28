import { createContext, useCallback, useContext, useState } from "react"
import { useConvexAuth } from "convex/react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { SignIn } from "@/components/SignIn"

const AuthGateContext = createContext<{
  requireAuth: (onAuthenticated?: () => void) => boolean
  openSignIn: () => void
}>({
  requireAuth: () => false,
  openSignIn: () => {},
})

export function AuthGateProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useConvexAuth()
  const [open, setOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  const openSignIn = useCallback(() => {
    setOpen(true)
  }, [])

  const requireAuth = useCallback(
    (onAuthenticated?: () => void) => {
      if (isAuthenticated) {
        onAuthenticated?.()
        return true
      }
      if (onAuthenticated) {
        setPendingAction(() => onAuthenticated)
      }
      setOpen(true)
      return false
    },
    [isAuthenticated]
  )

  // When auth state changes to authenticated while dialog is open, run pending action
  const handleAuthSuccess = useCallback(() => {
    setOpen(false)
    if (pendingAction) {
      pendingAction()
      setPendingAction(null)
    }
  }, [pendingAction])

  return (
    <AuthGateContext.Provider value={{ requireAuth, openSignIn }}>
      {children}
      <Dialog open={open} onOpenChange={(v) => { if (!v) { setOpen(false); setPendingAction(null) } }}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="sr-only">Sign in</DialogTitle>
          <SignIn onSuccess={handleAuthSuccess} />
        </DialogContent>
      </Dialog>
    </AuthGateContext.Provider>
  )
}

export function useRequireAuth() {
  return useContext(AuthGateContext)
}
