import { Doc } from "@/convex/_generated/dataModel"
import { useSessionId } from "@/pages/_app"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function Players({
  players,
  total,
  replayMode,
}: {
  players: { session: Doc<"sessions">; score: number }[]
  total: number
  replayMode?: boolean
}) {
  const sessionId = useSessionId()

  if (!replayMode) {
    const currentPlayerIndex = players.findIndex(
      (p) => (p.session._id as string) === (sessionId as string | null)
    )
    if (currentPlayerIndex === -1) {
      return null
    }

    const currentPlayer = players[currentPlayerIndex]
    players[currentPlayerIndex] = players[0]
    players[0] = currentPlayer
  }

  return (
    <div className="flex flex-wrap gap-2">
      {players.map((p) => (
        <Tooltip key={p.session._id}>
          <TooltipTrigger asChild>
            <div>
              <Badge
                variant="outline"
                className="cursor-default px-3 py-1 text-sm"
                style={{ borderColor: p.session.color, borderWidth: 2 }}
              >
                {p.session.name}
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            Score: {p.score} / {total} (
            {Math.floor((p.score / total) * 100)}%)
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
