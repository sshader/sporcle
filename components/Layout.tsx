import Link from "next/link"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useSessionId } from "@/pages/_app"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { PlayerSettings } from "@/components/PlayerSettings"
import { TooltipProvider } from "@/components/ui/tooltip"

export function Layout({ children }: { children: React.ReactNode }) {
  const sessionId = useSessionId()
  const session = useQuery(
    api.sessions.get,
    sessionId ? { sessionId } : "skip"
  )

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <nav className="border-b sticky top-0 z-50 bg-background">
          <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="text-lg font-semibold hover:opacity-80">
                Sporcle
              </Link>
              <Link href="/create">
                <Button variant="ghost" size="sm">
                  Create Quiz
                </Button>
              </Link>
            </div>
            {session && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <span
                      className="inline-block h-4 w-4 rounded-full"
                      style={{ backgroundColor: session.color }}
                    />
                    {session.name}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-64">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">Player Settings</p>
                    <PlayerSettings session={session} />
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </nav>
        <main className="max-w-3xl mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </TooltipProvider>
  )
}
