import { usePaginatedQuery } from "convex/react"
import { useRouter } from "next/router"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"

const formatRelativeTime = (timestamp: number) => {
  const diff = Date.now() - timestamp
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function GamePicker() {
  const { results } = usePaginatedQuery(
    api.game.getPublicGames,
    {},
    { initialNumItems: 10 }
  )
  const router = useRouter()

  async function handleJoinGame(gameId: Id<"game">) {
    await router.push({
      pathname: "/game/[gameId]",
      query: { gameId },
    })
  }

  if (!results) {
    return (
      <div className="space-y-2">
        <div className="h-12 rounded-md bg-muted animate-pulse" />
        <div className="h-12 rounded-md bg-muted animate-pulse" />
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No public games right now.</p>
    )
  }

  return (
    <div className="space-y-2">
      {results.map((r) => (
        <div
          key={r._id}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div className="flex flex-col gap-1">
            <span className="font-medium">{r.title ?? "Ongoing game"}</span>
            <div className="flex items-center gap-1.5">
              {r.playerSessions.map((p) => (
                <span
                  key={p._id}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white uppercase"
                  style={{ backgroundColor: p.color }}
                  title={p.name}
                >
                  {p.name.slice(0, 2)}
                </span>
              ))}
              {r.lastActiveTime && (
                <span className="text-xs text-muted-foreground ml-1">
                  {formatRelativeTime(r.lastActiveTime)}
                </span>
              )}
            </div>
          </div>
          <Button size="sm" onClick={() => handleJoinGame(r._id)}>
            Join game
          </Button>
        </div>
      ))}
    </div>
  )
}
